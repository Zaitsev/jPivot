function FC_Rendered(DOMId){
         //If it's our required chart
         if (DOMId=="chart1div"){
            //Simply alert 
            var chartObj = getChartFromId('chart1div');
            //window.alert("Look Ma! I am Column3D and I've finished loading and rendering.");
            return;
         }   
        }
function graph()
      {
      if (pv0==undefined) return null;
      //var pvdata = pv.data;
      var strXML = '';
      pv=pv0.pv;
      opts=pv0.opts;
      var ads='';
    var set = $('#FS_settindgs  [name=longlabels]:checked').val();
    //alert (set);
    if (set=='WRAP') {ads +=" labelDisplay='WRAP' "}
    if (set=='ROTATE') {ads+=" labelDisplay='ROTATE' "}
    if (set=='ROTATE slang') {ads+=" labelDisplay='ROTATE' slantLabels='1' "}
    if (set=='Stagger') {ads+=" labelDisplay='Stagger' "}
    if (set=='Stagger2') {ads+=" labelDisplay='Stagger' staggerLines='4' "}

    set = $('#FS_settindgs  [name=val_ins]:checked').val();
    if (set=='val_ins') {ads+=" placeValuesInside='1' showValues='1'  "}
    if (set=='val_non') {ads+=" showValues='0' "}
    set = $('#FS_settindgs  [name=val_norm]:checked').val();
    if (set=='val_rot') {ads+=" rotateValues='1' "}
    
       strXML +="<graph  palette='3' "+ads+"   baseFontSize='9' legendPosition='bottom' showLegend='1' xAxisName='"+data_headers[rows[0]]
       +"'  legendCaption='"+data_headers[cols[0]]+"' numberSuffix='%' decimalPrecision='0' animation='0' " 
       + "  rotateXAxisName='90' showYAxisValues='1' showDivLineValues='1' yaxismaxvalue='100' bgAngle='270'  bgAlpha='10,10' chartOrder='area,column,  line'>"; 
      var nm,c;
      strXML += "<categories>";
      for (var i=pv.col_keys_length; i< pv.data_rows_count;i++)
         {
         nm=''; for (c= pv.row_keys_length-1; c >=0; c--) nm +=  pv.data[i][c];
         strXML +="<category showLabel='1' toolText='"+nm+"' name='"+nm+"' /><vLine color='FF5904' thickness='2' />";
         }
      strXML +="</categories>";
      set = $('#FS_settindgs  [name=val_color]:checked').val();
      var use_color = (set == 'val_set' );
      //var line=[];
      //for (var row = 0 ; row < pv.data_rows_count; row++) line[row]=[0,0];
      var val;
      for (var col=pv.row_keys_length;col < pv.data_row_length ; col++)
            {
            strXML += "<dataset  renderAs='bar' alpha='100' seriesName='" + pv.data[pv.col_keys_length-1][col] + "' "+(use_color ? " color='"+colors[col-pv.col_keys_length]+"' ":'' )+" >";
            for (row = pv.col_keys_length ; row < pv.data_rows_count; row++)
                  {
                  if (pv.data[row][col] == undefined)
                    {
                     strXML +="<set />";
                    }
                  else
                    {
                    v = 0;
                    val=pv.data[row][col];
                    for (var i=0; i < val.length;i++) 
                      v+= parseFloat(opts.data[val[i]][data_col]);
                     strXML +="<set value='" + v + "' />";
                     //line[row][0] += parseFloat(val);line[row][1]++
                    }
                  }
            strXML +="</dataset>";
            } 
/*            
      strXML += "<dataset renderAs='AREA' seriesName='AVG' alpha='5' showValues='0' >";            
      for (row = 0 ; row < pv.data_rows_count; row++)  
          strXML += (line[row][1]) ? "<set value='" + (line[row][0] /  line[row][1]) + "' />" : "<set />";

          
         strXML +="</dataset>";
*/         
      strXML +="<trendlines>"
         strXML +="<line  alpha='20' startValue='90' endValue='100' color='F7C42A'  isTrendZone='1' displayValue='GOOD' showOnTop='1'/>"
         strXML +="<line  alpha='20' startValue='0'  endValue='25' color='F70000'  isTrendZone='1' displayValue='BAD' showOnTop='0'/>"
         strXML +="</trendlines>";
         strXML +="</graph>"
         return strXML;
      //chart1.render("chart1div");
         //updateChartXML('chart',strXML);
         
      }   
     var colors=new Array("AFD8F8", "F6BD0F", "8BBA00", "FF8E46","AFD8F8", "F6BD0F", "8BBA00", "FF8E46","AFD8F8", "F6BD0F", "8BBA00", "FF8E46");   
function redraw()
    {
       var strXML = graph();
      var chart1 = new FusionCharts("./FusionCharts/MSColumnLine3D.swf", "chart1div"
      , $("#resize_chart_1").width(), $("#resize_chart_1").height()
      , "0", 1); 
      chart1.setDataXML(strXML);
      chart1.setTransparent (true);
      chart1.render("chart1div");   
  
}   