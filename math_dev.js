function create_data()
		{
		var snum=0;
		for (var i=0; i < $(".vals_n").eq(0).slider("value"); i++)
		  for (var j=0; j < $(".vals_n").eq(1).slider("value"); j++)
		    for (var k=0;k < $(".vals_n").eq(2).slider("value"); k++)
		      for (var l=0;l < $(".vals_n").eq(3).slider("value"); l++)
		         	for (var m=0;m < $(".vals_n").eq(4).slider("value"); m++)
		         	   for (var p=0;p < $(".vals_n").eq(5).slider("value"); p++)
		              //data.push(['i'+i,'j'+j,'k'+k,'L'+l,'m'+m,'i'+i+'j'+j+'k'+k+'L'+l+'m'+m])  ;
		              data.push(['i'+i,'j'+j,'k'+k,'L'+l,'m'+m,'p'+p,snum++])  ;
     }
var data=[];
var rows = [0,1,2];	
var cols = [3,4,5];
var data_col=6;	
var agregate = [];
var filter = [];
var data_headers=['i','j','k','l','m','v']              ;