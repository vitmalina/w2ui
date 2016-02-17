package com.w2ui.servlets;

import java.io.IOException;
import java.util.Enumeration;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONObject;


/**
 * Base servlet for w2ui grid data management
 */
public abstract class W2uiGridData extends HttpServlet {
    /**
	 * 
	 */
	private static final long serialVersionUID = 5393402328979043064L;

	/**
     * @see HttpServlet#HttpServlet()
     */
    public W2uiGridData() {
        super();
    }
    
    /**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doPost(request, response);
	}
	
	protected void checkUserRights(HttpServletRequest request) throws Exception {
		// to be overridden
		// implement here authentication or user rights for cmd execution
		// and generate exception in case user rights is not valid
	}
	
	protected void logException(Exception ex) {
		// overridable for logging
	}
	
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {		
		JSONObject jsobj = new JSONObject();
		try {
			checkUserRights(request);
			
			JSONObject reqParams = requestToJson(request);
			
			String cmd = reqParams.getString("cmd");
			if (cmd == null) {
				throw new Exception("cmd not set");
			}
			if ( cmd.equals("save-records") ) {
				processSaveRecords(reqParams);
			} else if ( cmd.equals("save-record") ) {
				processSaveRecord(reqParams);
			} else if ( cmd.equals("delete-records") ) {
				int[] ids = paramToIntVector(reqParams, "selected");
				processDeleteRecords(ids);
			} else if (cmd.equals("get-records")) {
				JSONArray array = processGetRecords(reqParams);
				jsobj.put("total", array.length());
				jsobj.put("records", array);
			} else if (cmd.equals("get-record")) {
				JSONObject record = processGetRecord(reqParams);
				jsobj.put("record", record);
			} else {
				throw new Exception("Unknown command ["+cmd+"]");
			}
			jsobj.put("status", "success");
		} catch (Exception ex) {
			jsobj.put("status", "error");
			jsobj.put("message", ex.getMessage());
			logException(ex);
		}
		
		String jsonText = jsobj.toString();
		response.setContentLength(jsonText.length());
		response.setContentType("application/json");
		response.getWriter().write(jsonText);
	}
	
	private JSONArray readArray(HttpServletRequest request, String arrayName) {
		int cnt=0;
		JSONArray ret = new JSONArray();
		while(true) {
			JSONObject jsobj = null;
			String nameTmp = arrayName+"["+cnt+"]";
			Enumeration<String> names = request.getParameterNames();
			while (names.hasMoreElements()) {
				String name = names.nextElement();
				if ( !name.startsWith(nameTmp) ) {
					continue;
				}
				String fieldName = name.substring(nameTmp.length()).replace("[", "").replace("]", "");
				if (jsobj == null) {
					// is the first value of this entry
					jsobj = new JSONObject();
				}
				String[] values = request.getParameterValues(name);
				if (values.length == 1) {
					jsobj.put(fieldName, values[0]);
				} else {
					JSONArray arr = new JSONArray();
					for (int i=0; i < values.length; i++) {
						arr.put(values[i]);
					}
					jsobj.put(fieldName, arr);
				}
			}
			if (jsobj == null)  {
				// no more objects
				break;
			}
			ret.put(jsobj);
			cnt++;
		}
		return ret;
	}
	
	protected int[] paramToIntVector(JSONObject reqParams, String paramName) throws Exception{
		Object selected = reqParams.get(paramName);
		int[] ids;
		if (selected instanceof JSONArray) {
			JSONArray jsar = (JSONArray)selected;
			ids = new int[jsar.length()];
			for (int cnt = 0; cnt < jsar.length(); cnt++) {
				ids[cnt] = jsar.getInt(cnt);
			}
		} else if (selected instanceof String) {
			ids = new int[1];
			ids[0] = Integer.parseInt((String)selected);
		} else {
			throw new Exception("Wrong type of parameter ["+paramName+"]");
		}
		return ids;
	}
    
	private JSONObject requestToJson(HttpServletRequest request) {
    	JSONObject jsobj = new JSONObject();
		Enumeration<String> names = request.getParameterNames();
		while (names.hasMoreElements()) {
			String name = names.nextElement();
			if ( name.startsWith("search") || name.startsWith("sort")) {
				// these are treated later
				continue;
			}
			String localName = name;
			if (localName.endsWith("[]")) {
				// remove []
				localName = name.substring(0,  name.length()-2);
			}
			// find the value
			String[] values = request.getParameterValues(name);
			Object value = null;
			if (values.length == 1) {
				value = values[0];
			} else {
				JSONArray arr = new JSONArray();
				for (int i=0; i < values.length; i++) {
					arr.put(values[i]);
				}
				value = arr;
			}
			// check if localName is something like record[recid]
			int pos1 = localName.indexOf('[');
			if (pos1 > 0) {
				int pos2 = localName.indexOf(']', pos1);
				if (pos2 > 0) {
					// found!
					String objName = localName.substring(0, pos1);
					String fieldName = localName.substring(pos1+1, pos2);
					JSONObject jsobj2 = new JSONObject();
					if ( jsobj.has(objName) ) {
						jsobj2 = jsobj.getJSONObject(objName);
					}
					jsobj2.put(fieldName, value);
					jsobj.put(objName, jsobj2);					
					continue;
				}
			}
			
			jsobj.put(localName, value);
		}
		
		JSONArray arr = readArray(request, "sort");
		jsobj.put("sort", arr);
		
		arr = readArray(request, "search");
		jsobj.put("search", arr);
						
		return jsobj;
    }
  
    /**
     * processGetRecords: retrieve records from database in case command is "get-records"
     * Implement this function in child class
     * @param reqParams parameters extracted from request with requestToJson
     * @throws Exception
     */
    protected abstract JSONArray processGetRecords(JSONObject reqParams) throws Exception;
    
    /**
     * processGetRecord: retrieve a single from database in case command is "get-record"
     * If you need to get a single record implement this function in child class
     * @param reqParams parameters extracted from request with requestToJson
     * @throws Exception
     */
    protected JSONObject processGetRecord(JSONObject reqParams) throws Exception {
    	throw new Exception ("Save not implemented");
    }

    /**
     * processSaveRecords: save records on database in case command is "save-records"
     * If you need to save records implement this function in child class
     * @param reqParams parameters extracted from request with requestToJson
     * @throws Exception
     */
	protected void processSaveRecords(JSONObject reqParams) throws Exception {
		throw new Exception ("Save not implemented");
    }
	
	/**
     * processSaveRecord: save record on database in case command is "save-record"
     * If you need to save records implement this function in child class
     * @param reqParams parameters extracted from request with requestToJson
     * @throws Exception
     */
	protected void processSaveRecord(JSONObject reqParams) throws Exception {
		throw new Exception ("Save not implemented");
    }
	
	/**
     * processSaveRecords: delete records from database in case command is "delete-records"
     * If you need to delete records implement this function in child class
     * @param ids record ids that must be deleted
     * @throws Exception
     */
	protected void processDeleteRecords(int[] ids) throws Exception {
		throw new Exception ("Delete not implemented");
    }

}
