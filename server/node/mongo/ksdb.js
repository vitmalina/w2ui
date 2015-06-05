
var w2mdb = require('./w2mdb.js');

// numberMembers, Array must be converted to numbers before save!
// enumTextMember, is the text used for enumeration

exports.setupKickstartCollection = function(server,collname,numberMemebers)
{
   w2mdb.initCounters(collname); 
    
   var enumPath="/api/enum/"+ collname;
    
   var postPath="/api/"+ collname;
    
        
   server.post(postPath,function(req,res,next){   
       w2mdb.serveDBMongo(req,res,collname);
   });
    
    server.get(enumPath,function(req,res,next){   
       w2mdb.enumDBMongo(req,res,collname);
    });
    
};

exports.registerPaths = function(server)
{
    
  //console.log("Init counters@@@@@@@@@@@@@@@@@@@@@@@@@@@")
  w2mdb.initCounters("user");
  w2mdb.initCounters("users2");
  w2mdb.initCounters("groups");
  w2mdb.initCounters("roles");
    

//// ----------   Kickstart stuff -----------------
server.post("/api/login",function(req,res,next){   
	login(req,res,"login");
});

// Uses cookie?? To get info
server.post("/api/user",function(req,res,next){   
	login(req,res,"user");
});

server.post("/api/users",function(req,res,next){   
	w2mdb.serveDBMongo(req,res,"users2");
});

// /api/admin/users/delete
server.post("/api/admin/users/delete",function(req,res,next){   
	w2mdb.serveDBMongo(req,res,"users2");
});


server.get("/api/enum/users",function(req,res,next){   
	w2mdb.enumDBMongo(req,res,"users2","fname");
});


server.post("/api/admin/users",function(req,res,next){   
	w2mdb.serveDBMongo(req,res,"users2");
});

server.post("/api/user/save-photo",function(req,res,next){   
	w2mdb.serveDBMongo(req,res,"users2");
});


server.post("/api/admin/users/save",function(req,res,next){    
	w2mdb.serveDBMongo(req,res,"users2","userid");
});


server.post("/api/admin/groups",function(req,res,next){   
	w2mdb.serveDBMongo(req,res,"groups");
});

server.post("/api/groups",function(req,res,next){   
	w2mdb.serveDBMongo(req,res,"groups");
});


server.post("/api/admin/groups/save",function(req,res,next){   
   	w2mdb.serveDBMongo(req,res,"groups","groupid");
});


server.get("/api/enum/groups",function(req,res,next){   
	w2mdb.enumDBMongo(req,res,"groups","group_name");
});

server.post("/api/admin/roles",function(req,res,next){   
	w2mdb.serveDBMongo(req,res,"roles");
});

server.post("/api/admin/roles/delete",function(req,res,next){   
	w2mdb.serveDBMongo(req,res,"roles");
});

server.post("/api/admin/roles/save",function(req,res,next){   
	w2mdb.serveDBMongo(req,res,"roles","roleid");
});


server.get("/api/enum/roles",function(req,res,next){   
	w2mdb.enumDBMongo(req,res,"roles","role_name");
});

// Dummy photo
server.get("/api/user/:id/photo",function(req,res,next){   
	//w2mdb.enumDBMongo(req,res,"roles","role_name");
    var photo = '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBAQFBAYFBQYJBgUGCQsIBgYICwwKCgsKCgwQDAwMDAwMEAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/2wBDAQcHBw0MDRgQEBgUDg4OFBQODg4OFBEMDAwMDBERDAwMDAwMEQwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wgARCAC0AKADAREAAhEBAxEB/8QAHAABAAIDAQEBAAAAAAAAAAAAAAYHAwUIAgEE/9oACAEBAAAAAOqQAAAAfgh0v2IACC49bW2mnMhtHOAPFSVhiDP0XIABDufgFoXEAKRrsB66LkoBTNZgFpXAAc16EAsO7wDmTUAFj3WAUrW4B0PKwCoKsATu9wBQsHAXJZwBg53jgDpKQACAV1EQbfpsANJEKXBK+hwB5pSvfAPt7TsAqmowDa9I/sAh9BYgBmkcqsHfNLVde+QAH2wd5UngAAAAAAAAAAAAH//EABQBAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQIQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//EABQBAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQMQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//EAEEQAAIBAgIGBgUJBgcAAAAAAAECAwQFBhEABxIhMDETIjJBUWFCYnFyghAUFRYgI4GRokBTg5KxskNSYHOjwfD/2gAIAQEAAT8A/br7eKSzWqpuNUwWOBCwBOW02XVQebHdpBriw5DR0IrjK9XNBHLVdAm0sbuoJU7+0O/LSyYhs98pjUWypWojXISAZhlJ5Bgd44+I9ZseHcQG219K01MyhxNDkrqD6rM23/x6XbW7h+CKmnoZRVwzN0dTEqslRFmM+kAcbDhe9drSg120apVx19NtSw7Zo5oAQkwBOwGVutGWHvaYmxbesR1fT3CX7pTnDSpmIox5DvPrH5MI36zYbjEr3moaaYAy01JTRuiZjeNucjrdzMi6Vmu9TPFBbqQLDtKJKyszJ2TzYxQ5cvJtKCrirKKCqhlSeKZA6TRghGBGeYBJI4czSrEzRJ0kgHVTPZzPtOmJdc11jlqKC3UKUtREzRPUSOJiGU5EoqgJ+JLe7pV1dVWVElTVStPUSnaklclmYnxJ+1RTiCshmJCiNwxZo1lAGfMxv1X906YNuPT25Kd4YImjRZIpKQZUs0T71lhHob+3Gew/D1oYraw4fMdM+zcK8mGnI5ouXXk+FeXrMun/ALM8+BqZxaIKl8PVj5RTEyW9mPJ+bxj3u0vxcPXSK2XEEczjKip40p4szzkcGR8h7uxtfDwYpZYpUlicpLGweN1ORVlOYIOmr7FJxHh6OqlyFbA3QVgHLbUAhh5OpDcLXjWQm60FDFkJEjaeoy7y5CJ+lG4WomrK111o890kUUoHmjMp/vHCx1dXumLbnVEkoJmhi8NiE9GuXt2dr4uFqPJ+tVWM93zF938aLhYuts1txNcqOUEFJ3ZD4pIdtD+KsOFqOgkOJK2fL7taNkz9ZpYz/wBcLXjQpFf6CsUZGqp2R/Mwtz9uUnBAJIABJO4AbyT5aavMKNYbND0wAq54VapXvWRmZ2GfkrIn8Pha+GU1llXPrLHUEjyLRZf04Op+wUd0xHLU1SdIltRJo0PZMjMQhI79nZJ4euC7JXYuanjbajoIlgOX7w5u/wDcq/DwdRlvaO1XG4MMvnEyxRnxWJd/6mPCrxWtSSLRMiVTDKOSQEqpPpEDtZeGmOcPzWi9yoZZKlJGO1WSc5ZgqNM27d25dngE5Anw0wDZzacJW6kddmYxiWYD95L12/rw9adme5G00VOAKm41K0vStyjiGcrkD1mRGb3NMVYHkttHVXWjJ+jaarNF0b5mXqgDpWPLrv6Po/bwja1uuJrbQuco5ZlMh9VOsfzy0AAAAGQG4Dh4sttZV0ENVbwGuNtmWrpIzuDsmYaM/wC4hZNMdXK11mArjWW+XZNZNEamkbIPFNmA6uh6yvu63u/b1XVNNT43t7VBCrIJIkJ/zuuS8OSSOONpJGCRoCzuxyAAGZJJ0xvrYuNfUyUVhmNLbkJU1S7pZvEgnsJ4elpNLNPK000jSzPveSRizMfNjmT9tWZGDoxV1IZWG4gjeCDpqvx3Jf6N7fcGButGoJk5dNFyD+8OT8LXHjMov1coZN7APcXXwO9Yvx7T/DwsLX2WxX6kuaAssLZTIObRNudfy36Wq8Wy7Ui1dvqEqIWA3ocyCe5hzU+R4GO9Ylvw5TtTQFam7yL93ADmI8+Tyc8vJPS0qqmeqqZamocyTzOZJZG3lmY5knh0tZV0kolpZ5IJRyeJijfmDpb9ZuNqLILcnnQc0qAsuftZgX/VpatedYpVbrbklX0paZijfyPtA/zrph3HGG7+AtBVAVGWbUsv3co+E9r2ptfLiHGOH8Px7VxqlSUjNKdOvK3sQb9MTa5bzXq9PZ4/o6mO7pzk07Dy9GP9WkkkkjtJIxeRztO7EszE8ySd5PHVmRg6Eq6nNWU5EEd4I0wnrfu9tKUt5DXCiGQE3+Og9vKT4ut62msHWu9NNLacPuOmjJSpr+YVu9Yu4kd76TzzzzPPPI0s0hzeRyWYnzJ/0f8A/8QAFBEBAAAAAAAAAAAAAAAAAAAAgP/aAAgBAgEBPwBmf//EABQRAQAAAAAAAAAAAAAAAAAAAID/2gAIAQMBAT8AZn//2Q==';

    res.header('Content-Type', 'image/jpg');
    res.send(new Buffer(photo, 'base64'));
        
});

/*
 * 
 * '/api/user/:id/photo': function (req, res, next) {
var userid = req.info.route.id
var sql = 'SELECT photo FROM users \
WHERE userid = ' + userid;
w2db.exec(sql, function (err, result) {
var photo = '';
if (err || result.count == 0 || !result.records[0].photo) {
photo = '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';
} else {
photo = result.records[0].photo;
photo = photo.substr(photo.indexOf(',') + 1);
}
res.header('Content-Type', 'image/jpg');
res.send(new Buffer(photo, 'base64'));
});
},

 * 
*/    
    
    
};


// dataitem, contains the document item to extract from the collection
login = function(req, res, collectionName)
{
    // login
    // pass
    var resultData=
    {
       status : "success",
       user :  {  
           fname : "admin",
           lname : "admin",
           userid : "1", 
           login : "admin",
           super : true
       },
       goups : {},
       roles : {},
       services : ["/api","/api/user","/api/user/password" ]       
    };

    
     res.send(resultData);
};

