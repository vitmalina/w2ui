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
			} else if ( cmd.equals("delete-records") ) {
				processDeleteRecords(reqParams);
			} else if (cmd.equals("get-records")) {
				JSONArray array = processGetRecords(reqParams);
				jsobj.put("total", array.length());
				jsobj.put("records", array);
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
	
	protected JSONArray readArray(HttpServletRequest request, String arrayName) {
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
    
    protected JSONObject requestToJson(HttpServletRequest request) {
    	JSONObject jsobj = new JSONObject();
		Enumeration<String> names = request.getParameterNames();
		while (names.hasMoreElements()) {
			String name = names.nextElement();
			if (name.startsWith("search") || name.startsWith("sort")) {
				// these parameters are treater apart
				continue;
			}
			String localName = name;
			if (localName.endsWith("[]")) {
				// remove []
				localName = name.substring(0,  name.length()-2);
			}
			String[] values = request.getParameterValues(name);
			if (values.length == 1) {
				jsobj.put(localName, values[0]);
			} else {
				JSONArray arr = new JSONArray();
				for (int i=0; i < values.length; i++) {
					arr.put(values[i]);
				}
				jsobj.put(localName, arr);
			}
		}
		
		JSONArray search = readArray(request, "search");
		jsobj.put("search", search);
		
		JSONArray sort = readArray(request, "sort");
		jsobj.put("sort", sort);
		
		return jsobj;
    }
  
    protected abstract JSONArray processGetRecords(JSONObject reqParams) throws Exception;

	protected void processSaveRecords(JSONObject reqParams) throws Exception {
		throw new Exception ("Save not implemented");
    }
	
	protected void processDeleteRecords(JSONObject reqParams) throws Exception {
		throw new Exception ("Delete not implemented");
    }
}
