package com.w2ui.servlets.example;

import java.io.InputStream;
import java.util.Iterator;

import javax.servlet.Servlet;

import org.json.JSONArray;
import org.json.JSONObject;

import com.w2ui.servlets.W2uiGridData;

/**
 * Servlet implementation of a class derived from W2uiGridData
 * This class is not intended to be used in production but only to show how to implement methods
 * Recorda are stored in a database but only into an array in memory; you should
 * adjust (or rewrite) functions to interact with your favorite DBMS (Postgres, MySql, etc.)
 * 
 * Code of this class is not optimized and does not want to be: it is intended only as example
 */
public class W2uiGridExample extends W2uiGridData implements Servlet {
	private static final long serialVersionUID = 7163093252884618719L;

	/**
	 * this variable simulates the users database
	 * it is NOT thread safe ... but this is just an example
	 */
	protected static JSONArray dbUsers = new JSONArray();
	
	static {
		// Load the simulated database for the first time
		InputStream is = null;
		try {
			StringBuffer sb = new StringBuffer();
			is = W2uiGridExample.class.getResourceAsStream("users.json");
			while (is.available() > 0) {
				int n = is.read();
				sb.append((char)n);
			}
			String json = sb.toString();
			JSONObject jsobj = new JSONObject(json);
			dbUsers = jsobj.getJSONArray("records");
		} catch (Exception ex1) {
		} finally {
			try {
				is.close();
			} catch (Exception ex2) {
			}
		}
	}
	
    /**
     * @see W2uiGridData#W2uiGridData()
     */
    public W2uiGridExample() {
        super();
    }
    
    @Override
    protected void logException(Exception ex) {
    	ex.printStackTrace();
    }

	@Override
	protected JSONArray processGetRecords(JSONObject reqParams)
			throws Exception {
		JSONArray records = new JSONArray();
		JSONArray search = null;
		if (reqParams.has("search")) {
			search = reqParams.getJSONArray("search");
		}
		if ( (search == null) || (search.length() == 0) ){
			records = dbUsers;
		} else {
			// this simulate the DB query with filter
			boolean logicAnd = false;
			if (reqParams.has("searchLogic")) {
				String searchLogic = reqParams.getString("searchLogic");
				if ( (searchLogic != null) && searchLogic.equals("AND") ) {
					logicAnd = true;
				}
			}
			for (int userCnt = 0; userCnt < dbUsers.length(); userCnt++) {
				JSONObject record = dbUsers.getJSONObject(userCnt);
				boolean canUse = true;
				if (!logicAnd) {
					// OR: by default canot use record but if one criteria is satisfied flag will be set to true
					canUse = false;
				}
				
				for (int i=0; i < search.length(); i++) {
					JSONObject par = search.getJSONObject(i);
					String field = par.getString("field");
					String value = par.getString("value");
					String type = par.getString("type");
					boolean found = false;
					if ( record.has(field) && !record.isNull(field) ) {
						if ( type.equals("text") ) {							
							String recValue = record.getString(field);
							String operator = par.getString("operator");						
							// put both lowercase: i.e. search is case insensitive
							recValue = recValue.trim().toLowerCase();
							value = value.trim().toLowerCase();
							if (operator.equals("is")) {
								found = recValue.equals(value);
							} else if (operator.equals("contains")) {
								found = recValue.contains(value);
							} else if (operator.equals("begins")) {
								found = recValue.startsWith(value);
							} else if (operator.equals("ends")) {
								found = recValue.endsWith(value);
							} else {
								throw new Exception("Operator "+operator+" not implemented for type text");
							}
						} else  {
							throw new Exception("Search type "+type+" not implemented");
						}
					}
					if (logicAnd) {
						// AND
						if ( !found ) {
							canUse = false;
						}
					} else {
						// OR
						if ( found ) {
							canUse = true;
						}
					}
				}
				if (canUse) {
					records.put(record);
				}
			}
		}
		// apply offset and limit
		int offset = 0;
		if (reqParams.has("offset")) {
			offset = reqParams.getInt("offset");
			if (offset < 0) {
				offset = 0;
			}
		}
		int limit = records.length();
		if (reqParams.has("limit")) {
			limit = reqParams.getInt("limit");
			if (limit < 0) {
				limit = records.length();
			}
		}
		JSONArray ret = new JSONArray();
		for (int i=offset; (i < offset+limit) && (i < records.length()); i++) {
			ret.put(records.getJSONObject(i));
		}
		
		// NOTE: sorting is not implemented here
		// if you have a DBMS you should do it in the query reading the properties contained in
		// field "sort"
		
		return ret;
	}
	
	@Override
	protected JSONObject processGetRecord(JSONObject reqParams) throws Exception {
		int recid = reqParams.getInt("recid");
		for (int i=0; i < dbUsers.length(); i++) {
			JSONObject jsobj = dbUsers.getJSONObject(i);
			int id = jsobj.getInt("recid");
			if (id == recid) {
				return jsobj;
			}
		}
		throw new Exception("Not found");
	}
		
	protected void updateRecord(int recid, JSONObject change) throws Exception {
		for (int i=0; i < dbUsers.length(); i++) {
			JSONObject jsobj = dbUsers.getJSONObject(i);
			int id = jsobj.getInt("recid");
			if (recid == id) {
				// update the record
				Iterator<String> it = change.keys();
				while (it.hasNext()) {
					String key = it.next();
					Object obj = change.get(key);
					jsobj.put(key, obj);
				}
				// put record on DB
				dbUsers.put(i, jsobj);
				return;
			}
		}
		// if we are here no update has been done: we add a new record
		change.put("recid", recid);
		dbUsers.put(change);
    }

	protected void processSaveRecords(JSONObject reqParams) throws Exception {
		JSONArray changed = reqParams.getJSONArray("changes");
		for (int cnt=0; cnt < changed.length(); cnt++) {
			JSONObject change = changed.getJSONObject(cnt);
			int recid = change.getInt("recid");
			updateRecord(recid, change);
		}
    }
	
	protected void processSaveRecord(JSONObject reqParams) throws Exception {
		JSONObject change = reqParams.getJSONObject("record");
		int recid = reqParams.getInt("recid");
		updateRecord(recid, change);
    }
	
	protected void processDeleteRecords(int[] ids) throws Exception {
		JSONArray newDB = new JSONArray();
		for (int i=0; i < dbUsers.length(); i++) {
			JSONObject jsobj = dbUsers.getJSONObject(i);
			int recid = jsobj.getInt("recid");
			boolean remove = false;
			for (int cnt=0; cnt < ids.length; cnt++) {
				if (recid == ids[cnt]) {
					// do not add in new DB the record
					remove = true;
					break;
				}
			}
			if ( !remove ) {
				newDB.put(jsobj);
			}
		}
		// replace DB
		dbUsers = newDB;
    }
}
