var num=2;
var snum=0;
var data=[];
for (var i=0; i < num; i++)
  for (var j=0; j < num; j++)
    for (var k=0;k < num; k++)
      for (var l=0;l < num; l++)
         	for (var m=0;m < num; m++)
         	   for (var p=0;p < num; p++)
              //data.push(['i'+i,'j'+j,'k'+k,'L'+l,'m'+m,'i'+i+'j'+j+'k'+k+'L'+l+'m'+m])  ;
              data.push(['i'+i,'j'+j,'k'+k,'L'+l,'m'+m,'p'+p,snum++])  ;
var rows = [0,1,4];	
var cols = [2,3];
var data_col=6;	
var agregate = [5];
var filter = [];
var data_headers=['i','j','k','l','m','v']              ;