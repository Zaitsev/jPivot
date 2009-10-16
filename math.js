var num=2;
var data=[];
for (var i=0; i < num; i++)
  for (var j=0; j < num; j++)
    for (var k=0;k < num; k++)
      for (var l=0;l < num; l++)
         	for (var m=0;m < num; m++)
              data.push(['i'+i,'j'+j,'k'+k,'l'+l,'m'+m,'i'+i+'j'+j+'k'+k+'l'+l+'m'+m])  ;
var rows = [0,1,2,3];	
var cols = [4];
var data_col=5;	
var filter = [];
var data_headers=['i','j','k','l','m','v']              ;