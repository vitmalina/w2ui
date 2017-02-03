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
			if ( !reqParams.has("cmd") ) {
				throw new Exception("cmd not set");
			}
			String cmd = reqParams.getString("cmd");
			if ( cmd.equals("save-records") ) {
				processSaveRecords(reqParams);
			} else if ( cmd.equals("save-record") || cmd.equals("save") ) {
				processSaveRecord(reqParams);
			} else if ( cmd.equals("delete-records") || cmd.equals("delete") ) {
				int[] ids = paramToIntVector(reqParams, "selected");
				processDeleteRecords(ids);
			} else if (cmd.equals("get-records") || cmd.equals("get")) {
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
		boolean found = false;
		while(true) {
			JSONObject jsobj = null;
			String nameTmp = arrayName+"["+cnt+"]";
			Enumeration<String> names = request.getParameterNames();
			while (names.hasMoreElements()) {
				String name = names.nextElement();
				if ( !name.startsWith(nameTmp) ) {
					continue;
				}
				found = true;
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
		if ( !found ) {
			return null;
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
		// first it checks if the parameter request has been passed with a valid json
		String reqJson = request.getParameter("request");
		if ( reqJson != null ) {
			try {
				JSONObject jsobj = new JSONObject(reqJson);
				return jsobj;
			} catch (Exception ex) {
			}
			// if we are here "request" is not a valid json
		}
		JSONObject jsobResult = new JSONObject();
		// secondly it checks the classic way
		Enumeration<String> names = request.getParameterNames();
		while (names.hasMoreElements()) {
			String name = names.nextElement();
			if ( name.startsWith("search") || name.startsWith("sort") ||
				name.startsWith("changes") ) {
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
					// found first level
					String objName1 = localName.substring(0, pos1);
					String fieldName1 = localName.substring(pos1+1, pos2);
					JSONObject jsobj1 = new JSONObject();
					if ( jsobResult.has(objName1) ) {
						jsobj1 = jsobResult.getJSONObject(objName1);
					}
					// check if there is a second level
					int pos3 = localName.indexOf('[', pos2);
					if (pos3 > 0) {
						int pos4 = localName.indexOf(']', pos3);
						if (pos4 > 0) {
							String objName2 = fieldName1;
							String fieldName2 = localName.substring(pos3+1, pos4);
							JSONObject jsobj2 = new JSONObject();
							if ( jsobj1.has(objName2) ) {
								jsobj2 = jsobj1.getJSONObject(objName2);
							}
							jsobj2.put(fieldName2, value);
							jsobj1.put(objName2, jsobj2);
						} else {
							// we should not arrive here ....
							jsobj1.put(fieldName1, value);
						}
					} else {
						jsobj1.put(fieldName1, value);
					}
					jsobResult.put(objName1, jsobj1);
					continue;
				}
			}

			jsobResult.put(localName, value);
		}

		JSONArray arr = readArray(request, "sort");
		if (arr != null) {
			jsobResult.put("sort", arr);
		}

		arr = readArray(request, "search");
		if (arr != null) {
			jsobResult.put("search", arr);
		}

		arr = readArray(request, "changes");
		if (arr != null) {
			jsobResult.put("changes", arr);
		}

		return jsobResult;
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
    	throw new Exception ("GetRecord not implemented");
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
