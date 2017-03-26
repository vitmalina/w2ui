if(!window.console){
	var console = {
		s:{
			id:'fauxconsole'
			,v:false
			,d:{}
			,init:function(){
				console.s.d=document.createElement('div')
				var a=document.createElement('a');
				a.href='javascript:console.s.hide()';
				a.innerHTML='close';
				console.s.d.appendChild(a);
				var a=document.createElement('a');
				a.href='javascript:console.s.clear()';
				a.innerHTML='clear';
				console.s.d.appendChild(a);
				var id = console.s.id;
				if(!document.getElementById(id)){
					console.s.d.id=id;
				}
				console.s.hide();
			}
			,hide:function(){
				console.s.d.style.display='none';
			}
			,show:function(){
				console.s.d.style.display='block';
			}
			,clear:function(){
				console.s.d.parentNode.removeChild(console.s.d);
				console.s.init();
				document.body.appendChild(console.s.d);
				console.s.show();
			}
			,addLoadEvent:function(func){
				var oldonload=window.onload;
				if(typeof window.onload!='function'){
					window.onload=func;
				}
				else{
					window.onload=function(){
						if(oldonload){
							oldonload();
						}
						func();
					}
				}
			}
		}
		,log:function(o){
			console.s.d.innerHTML+='<br/>'+o;
			console.s.show();
		}
	};
	console.s.init();
	console.s.addLoadEvent(function(){document.body.appendChild(console.s.d)});

	document.write('\
		<style type="text/css">\
		#fauxconsole{\
		z-index:1700;\
			position:absolute;\
			top:0;\
			right:0;\
			width:300px;\
			border:1px solid #999;\
			font-family:courier,monospace;\
			background:#eee;\
			font-size:10px;\
			padding:10px;\
		}\
		html>body #fauxconsole{\
			position:fixed;\
		}\
		#fauxconsole a{\
			float:right;\
			padding-left:1em;\
			padding-bottom:.5em;\
			text-align:right;\
		}\
		</style>\
	');
}