package com.w2ui.servlets.example;

import java.io.InputStream;

import javax.servlet.Servlet;

import org.json.JSONArray;
import org.json.JSONObject;

import com.w2ui.servlets.W2uiGridData;

/**
 * Servlet implementation class W2uiGridExample
 */
public class W2uiGridExample extends W2uiGridData implements Servlet {
	private static final long serialVersionUID = 7163093252884618719L;

	// this variable simulates the users database
	// it is NOT thread safe ... but this is just an example
	protected static JSONArray dbUsers = new JSONArray();
	
	static {
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
			reqParams.getInt("offset");
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
		
		return ret;
	}

	protected void processSaveRecords(JSONObject reqParams) throws Exception {
		throw new Exception ("TO DO");
    }
	
	protected void processDeleteRecords(JSONObject reqParams) throws Exception {
		throw new Exception ("TO DO");
    }
}
