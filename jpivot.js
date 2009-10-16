(function($) { 
// Private Variables and Functions
var  jpv_keys_placeholder_update_list_cnt=0; 
var debug=1;
//debug functions
function emsgd(obj)
        {
        if ($.browser.mozilla) 
            {
            if (!debug) return;
            if (typeof obj == 'object') console.dir(obj);
            else console.info(obj);
            console.trace()
            }
        }

function jpv_rowsSort(a,b,$this)
        {
         //Compare "a" and "b" in some fashion, and return -1, 0, or 1
         //Less than 0: Sort "a" to be a lower index than "b"
         //Zero: "a" and "b" should be considered equal, and no sorting performed.
         //Greater than 0: Sort "b" to be a lower index than "a".
         // rows keep idexes of row keys 
         // cols keep idexes of col keys 
         //compare by rows order then cols order
         var rows=$this.opts.rows;
         var cols=$this.opts.cols;
         var order=$this.pv.dialog_sort;
         var len = rows.length
         for (i=0;i < len;i++)
                 {
                 if (a[rows[i]] < b[rows[i]] ) return  1*order[rows[i]]; 
                 if (a[rows[i]] > b[rows[i]] ) return -1*order[rows[i]]; 
                 }
/*      
cols we sort later, because problems wehd data has gaps                
         for (i=0;i < cols.length;i++)
                 {
                 if (a[cols[i]] < b[cols[i]] ) return  1*order[cols[i]]; 
                 if (a[cols[i]] > b[cols[i]] ) return -1*order[cols[i]]; 
                 }             
*/                 
         return 0;
        }
function jpv_colsSort(a,b,$this)
        {
         //Compare "a" and "b" in some fashion, and return -1, 0, or 1
         //Less than 0: Sort "a" to be a lower index than "b"
         //Zero: "a" and "b" should be considered equal, and no sorting performed.
         //Greater than 0: Sort "b" to be a lower index than "a".
         // rows keep idexes of row keys 
         // cols keep idexes of col keys 
         //compare by rows order then cols order
         var colsa=a.split('~~~');
         var colsb=b.split('~~~');
         var len =  colsa.length;
         var i,k;
         var order=$this.pv.dialog_sort;
         var cols=$this.opts.cols;
         for (i=0; i< len; i++)
               {
                k = order[cols[i]]
             if (colsa[i] < colsb[i] ) return  1*k;
             if (colsa[i] > colsb[i] ) return -1*k; 
               }
               
         return 0;
        }
function in_array(element, array, addIfAbsent) 
        {
      var len =array.length
      for (var i = 0; i < len; i++) 
          {
          if (element == array[i])       return i;
          }
      if (addIfAbsent) 
          {
        array.push(element);
        return (array.length - 1);
          }
      return null;
        }
function jpv_count_keys_span2(span_array,key_num,key)    
        {
        //create array of [key,count] like  [ [key1,1],[key2,2],[key1,1] ]
        var last_element=span_array[key_num].length-1
        //create new row for this key and for all at "right" from it by duplicate key
        var i,len=span_array.length;
        span_array[key_num].push([key,1]);
        for (i=key_num+1; i< len; i++)
        span_array[i].push([span_array[i][span_array[i].length-1][0],1]);
        
        }         
function jpv_count_keys_span(span_array,key)    
        {
        //create array of [key,count] like  [ [key1,1],[key2,2],[key1,1] ]
        var last_element=span_array.length-1
        if ( (last_element >= 0) && (span_array[last_element][0]==key)) span_array[last_element][1]++;
        else span_array.push([key,1]);
        }    
function jpv_create_2Darray(len)
        {
        var a=[];
        for (var i=0;i<len;i++) a[i]=[];
        return a;
        }        
function jpv_keys_placeholder_update($this, event, ui)
        {
        //this func called for each lists (we have 3) so wait until last 
        if (jpv_keys_placeholder_update_list_cnt++ > 1) 
            {
            var rows=[]; var cols=[]; var filter=[];
            $('li','#pv_colkeys_placeholder').each(
                    function () 
                        { 
                        cols.push($(this).attr('value')) 
                        }
                    );
            $('li','#pv_rowkeys_placeholder').each(
                    function () 
                        { 
                        rows.push($(this).attr('value')) 
                        }
                    )    ;        
            $('li','#pv_filter').each(
                    function () 
                        { 
                        filter.push($(this).attr('value')) 
                        }
                    )    ;                            
            jpv_keys_placeholder_update_list_cnt=0;
            $this.opts.cols=cols;
            $this.opts.rows=rows;
            $this.opts.filter=filter;
            jQuery.fn.jPivot.preparePv($this);
            jpv_pivotDrawData($this);
            jpv_pivotDrawData_new($this);
            }
        }    
function jpv_keys_placeholder_popup($this)
        {
        var keys_index=$this.pv.keys_index;
        var keys_index_length=$this.pv.keys_index.length;
        var data_headers = $this.opts.data_headers;
        var tstr='';
        var use_printKey = $.isFunction($this.opts.printKey),printed_key='';
        for (k=0;k<keys_index_length;k++)
            {
            unique_keys=$this.pv.unique_keys[k];
             unique_keys_length=$this.pv.unique_keys[k].length;
            if ( (unique_keys == null) ||  (unique_keys.length == 0) )
                {
                $('#pv_dlg_plh'+k).remove(); //remove placeholder
                continue;    
                }
            if (keys_index[k] == 3)
                {//is a filter
                tstr ='<li id="pv_dlg_plh'+k+'" value="'+k+'"class="ui-state-highlight">'+data_headers[k]+'<select> ';
                for (j=0;j < unique_keys_length; j++)
                        {
                                   printed_key =  (use_printKey) ? $this.opts.printKey(k,unique_keys[j]) :  unique_keys[j];
                        tstr +='<option value="'+unique_keys[j]+'">'+printed_key+'</option>';
                        }
                tstr +='</select></li>';
                $('#pv_filter',$this).append(tstr);
                //set current
                $('#pv_dlg_plh'+k+' select',$this).val( ($this.pv.head_filter[k]==null) ? unique_keys[0] : $this.pv.head_filter[k] )
                //bind click event
                $('#pv_dlg_plh'+k+' select',$this).bind
                            (
                            "change"
                            ,function(e) 
                                {
                                jQuery.fn.jPivot.preparePv($this);
                                jpv_pivotDrawData($this);
                                jpv_pivotDrawData_new($this);
                                }
                             );                                
        
                //this is filter, bind new behavior
                $('#pv_key_header'+k,$this).unbind('click');
                continue;
                }
            else
                {//is a dialog for col and row headers
                if ($this.pv.dialog_filter[k].length > 0) $('#pv_key_header'+k,$this).addClass('pv_key_header_filtered');//we have filtered keys - show this
                if ($('#pv_dlg_plh'+k).length == 0)
                    { 
                    //we have no dialog,create
                    tstr='<div id="pv_dlg_plh'+k+'" style="display:none">';
                    tstr +='asc<input type="radio" name="pv_dlg_plh'+k+'_order" checked value="A">dsc<input type="radio" name="pv_dlg_plh'+k+'_order" value="D"><hr>'
                    for (i=0; i < unique_keys_length; i++)
                          {
                                 printed_key = (use_printKey) ? $this.opts.printKey(k,unique_keys[i]) : unique_keys[i];
                        tstr +=printed_key+'<input type="checkbox" checked name="pv_dlg_plh'+k+'_flt[]" value="'+unique_keys[i]+'"><br>'
                        }
                    tstr +='</div>';
                    $($this).append(tstr);
                    $('#pv_dlg_plh'+k).dialog
                            ({
                            autoOpen:false
                         ,title:false
                         ,dialogClass:'pv_dialog'
                         ,buttons: {
                                    Ok: function() 
                                        {
                                        jQuery.fn.jPivot.preparePv($this);
                                        jpv_pivotDrawData($this);
                                        jpv_pivotDrawData_new($this);
                                        $(this).dialog('close');
                                        }
                                    ,Cancel: function() 
                                        {
                                        $(this).dialog('close');
                                        }
                                    }
                                            
                            });
                    }
                  //bind click event
                  $('#pv_key_header'+k,$this).bind
                              (
                              "click"
                              ,{selector:'#pv_dlg_plh'+k}
                              ,function(e) 
                                  {
                                  $(e.data.selector)
                                          .dialog('option', 'position', [e.pageX,e.pageY])
                                          .dialog("open")
                                  }
                               );
                  }
            }
        }        
function jpv_pivotDrawData_new($this)
        {
        	//return;
      //draw data
      //start header draw
        var table_data=[];
        var opts=$this.opts;
        var pv=$this.pv;
        var filter_length= opts.filter.length;
        var row_keys_length=pv.keys_rowspan.length;
            row_keys_length= (!row_keys_length) ? 1 : row_keys_length; //fix when no row keys, reserve place for key header placeholder
        var col_keys_length=pv.data_header.length;
				
        //temp vars
				var r;var c;        var tstr='';
        //create array for table_data
        var td_data_rows_start = 1+col_keys_length;//actual data start 1(row headers here and delimiter) +[rows keys count]
        var td_rows_count=td_data_rows_start+pv.data_rows_count;//+ [number of rows with data]; 

        var td_data_cols_start=row_keys_length+1; //  actual data start [rows keys count]+1(cols headers here)
        var td_cols_count=td_data_cols_start+pv.data_row_length-row_keys_length;// + [number of cols with data]; 
        var pv2td_data_col_diff= -row_keys_length+td_data_cols_start
        //fill rows
        for (r=0;r < td_rows_count; r++) 
        		{
        		table_data[r]=[];
        		for (c=0;c < td_cols_count; c++) table_data[r][c]=null;
        		}
        //put top left td
        table_data[0][0]='0-0';
        
        
        //fill cols header
        for (r=0;r<col_keys_length;r++)
        	for (c=row_keys_length; c < pv.data_row_length; c++)  //loop by pv.data_header[r]
                			 table_data[r][c+pv2td_data_col_diff]=''+pv.data_header[r][c]+'';
        
        			 
        //fill rows header and data
        for (r=0;r<pv.data_rows_count;r++)
        	{
        	for (c=0; c < row_keys_length; c++)                table_data[r+td_data_rows_start][c]=pv.data[r][c],0;
        	for (c=row_keys_length; c < pv.data_row_length; c++)  table_data[r+td_data_rows_start][c+pv2td_data_col_diff]=(pv.data[r][c]==undefined) ? null: pv.data[r][c]; //fill with array of indexes of actual data rows (opts.data)
        	}
        //create colspans
        if (col_keys_length > 0 )
            {
            //top row
            r=0;
            var old; var cnt=1;
            for (r=0;r<col_keys_length;r++)
                {
                old=table_data[r][td_data_cols_start];
                cnt=1;                  
                for (c=td_data_cols_start+1; c < td_cols_count; c++)  
                    {
                    if ((old != table_data[r][c]) || (r>0) && (table_data[r-1][c-1]!= null)  )
                        {
                        old = table_data[r][c];
                        if (cnt > 1 ) table_data[r][c-1] ='<td colspan="'+cnt+'">'+table_data[r][c-1]+'</td>' ;
                        cnt=1;   
                        continue                     
                        }
                     cnt++;
                     table_data[r][c-1]=null;
                     }
                //last col
                if (cnt > 1 ) table_data[r][c-1] ='<td colspan="'+cnt+'">'+table_data[r][c-1]+'</td>' ;                   
                }
            }

/*        
        var span=0; var ind=0; var val='';
        if (row_keys_length > 0)
            {
            for (c=0;c<row_keys_length-1;c++)
                {
                //span=0; ind=0; val=table_data[td_data_rows_start][c];
                for (r=td_data_rows_start; r < td_rows_count; r++)
                    {
                    if (table_data[r][c] != null)
                      {
                      ind=r;val=table_data[r][c];
                      if (r > 0) table_data[ind][c] =  '<td colspan='+span+'>'+val+'</td>';
                      }
                    else
                      {
                      span++;
                      }
                    }                 
                }
            }      
*/                  
        /*            
        //create rowspans 
        if (row_keys_length > 0)
            {
            for (c=0;c<row_keys_length;c++)
                {
                old=table_data[td_data_rows_start][c]; 
                cnt=1;  
                for (r=td_data_rows_start+1; r < td_rows_count; r++)
                    {
                    if ((old != table_data[r][c]) || (c>0) && (table_data[r-1][c-1]!= null)  )
                        {
                        old = table_data[r][c];
                        table_data[r-1][c] ='<td rowspan="'+cnt+'">'+table_data[r-1][c]+'</td>' ;
                        cnt=1;   
                        continue                     
                        }
                     cnt++;
                     table_data[r-1][c]=null;                     
                    }
                //last col
                table_data[r-1][c] ='<td rowspan="'+cnt+'">'+table_data[r-1][c]+'</td>' ;                 
                }
            }  
            */			 
        return;
      
 }                
function jpv_pivotDrawData($this)
        {
      //draw data
      //start header draw
           var tstr='';
        var table_data_html=[];
        var opts=$this.opts;
        var pv=$this.pv;
        var filter_length= opts.filter.length;
        table_data_html.push('<div>flt<ul class="pv_keys_placeholder" id="pv_filter"></ul></div><br><br>');
        table_data_html.push('<table class="pv_table">');

        keys_colspan_length=pv.keys_colspan.length;
        keys_rowspan_length=pv.keys_rowspan.length
        //header colspans
        if (keys_colspan_length==0)
                {
                //place placeholder only
                table_data_html.push('<tr id="pv_tr_h_col0"><th colspan="'+keys_rowspan_length+'" ></th><th class="ui-state-default"><ul style="width:20px;height:20px;" class="pv_keys_placeholder" id="pv_colkeys_placeholder"></ul></th><th></th>');                 
                }
        var use_printKey = $.isFunction(opts.printKey),printed_key='';
        for (r=0;r < keys_colspan_length;r++)
                {
                len=pv.keys_colspan[r].length;
                table_data_html.push("<tr id=\"pv_tr_h_col"+r+"\">\n");                 
                for (c=0;c<len;c++)
                      {
                      if ((r==0) && (c==0)) 
                          {
                          table_data_html.push('<th colspan="'+keys_rowspan_length+'" rowspan="'+keys_colspan_length+'"></th>'); //top left td
                          //col keys dragable
                          table_data_html.push(
                              '<th style="min-width:40px;" rowspan="'+pv.keys_colspan.length+'">'
                              +'<ul class="pv_keys_placeholder" id="pv_colkeys_placeholder">');
                          for (i=0;i<opts.cols.length;i++) 
                              {
                              table_data_html.push(
                                  '<li id="pv_key_header'+opts.cols[i]+'" value="'+opts.cols[i]+'" class="ui-state-highlight">'
                                  +'<span style="float:right;" class="ui-icon '+(pv.dialog_sort[opts.cols[i]] > 0  ? 'ui-icon-triangle-1-s ' : 'ui-icon-triangle-1-n' )+' "></span>'
                                  +opts.data_headers[opts.cols[i]] 
                                  +'</li>');
                              }
                          table_data_html.push('</ul></th>');
                          }
                                  printed_key = (use_printKey) ? opts.printKey(opts.cols[r],pv.keys_colspan[r][c][0]) : pv.keys_colspan[r][c][0];
                       table_data_html.push('<th  class="ui-state-default" colspan="'+pv.keys_colspan[r][c][1]+'">'+printed_key+'</th>');
                       }
                table_data_html.push("</tr>\n"); 
                }
                
        //row keys dragable

      if (keys_rowspan_length==0)
          {
          //place placeholder only
            table_data_html.push('<tr><th  class="ui-state-default" style="min-width:40px;" colspan="'+keys_rowspan_length+'"><ul class="pv_keys_placeholder" id="pv_rowkeys_placeholder"></ul></th><td colspan="'+pv.data_row_length+'"></td></tr>');
          }
      else
          {
            table_data_html.push('<tr><th style="min-width:40px;" colspan="'+keys_rowspan_length+'"><ul class="pv_keys_placeholder" id="pv_rowkeys_placeholder">');
            for (i=0;i< keys_rowspan_length ;i++) 
                  {
                  table_data_html.push(
                        '<li id="pv_key_header'+opts.rows[i]+'" value="'+opts.rows[i]+'" class="ui-state-highlight">'
                        +'<span style="float:right;" class="ui-icon '+(pv.dialog_sort[opts.rows[i]] > 0  ? 'ui-icon-triangle-1-s ' : 'ui-icon-triangle-1-n' )+' "></span>'
                         +opts.data_headers[opts.rows[i]]
                         +'</li>');
                  }
            table_data_html.push("<td rowspan="+(1+pv.data_rows_count)+"></td><td colspan="+(pv.data_row_length-keys_rowspan_length)+"></td></ul></tr>\n"); 
            }
        
        //draw data
        var ind_r=[]; for (r=0; r < keys_rowspan_length;r++) {ind_r.push([0,0,0]);} 
        var use_printVal = $.isFunction(opts.printValue);
        
        for (r=0;r< pv.data_rows_count;r++)
              {
              table_data_html.push("<tr>\n"); 
              for (c=0;c< pv.data_row_length;c++)
                  {
                   need_total=-1;
                   if ((c==0) && (keys_rowspan_length==0)) table_data_html.push('<td></td><td></td>'); //we have placeholder only, reserve area below it
                   if  (c < keys_rowspan_length)  
                      {//row key header
                      ind_r[c][2]=0;
                      if (ind_r[c][0] == r)
                          {
                          printed_key =(use_printKey) ? opts.printKey(opts.rows[c],pv.keys_rowspan[c][ind_r[c][1]][0]) : pv.keys_rowspan[c][ind_r[c][1]][0]; 
                          table_data_html.push('<th  rowspan = "'+(pv.keys_rowspan[c][ind_r[c][1]][1])+'" class="ui-state-default">'+printed_key+'</th>');
                          ind_r[c][0] += pv.keys_rowspan[c][ind_r[c][1]][1]; //set when next th will be needed by row
                          ind_r[c][1]++ ; //set for which section we see
                          ind_r[c][2]=1; //we need total after this row;
                          }
                      }
                  else
                      {//data
                      if (use_printVal) 
                         table_data_html.push('<td>'+opts.printValue(pv.data[r][c])+'</td>');
                      else 
                         table_data_html.push('<td>'+pv.data[r][c]+'</td>');
                      }
                  }
              table_data_html.push("</tr>\n");
							//print total
							/*
							for (c=0;c< keys_rowspan_length;c++)
								 if (ind_r[c][2])
								 		{
								 		//total here
								 		table_data_html.push("<tr><td>"+c+"</td><td>2</td><td></td></tr>");
								 		 table_data_html.push("<tr>");
								 		 for (i=0;i< pv.data_row_length;i++)
								 		  table_data_html.push("<td cols> for key="+c+"</td>\n");
								 		table_data_html.push("</tr>");
								 		}
							*/	 		
              }
        table_data_html.push('</table>');
        //end draw data
        var str=table_data_html.join(' ');
        
        //draw table
        $($this).empty().append(str);
        
        //create sortable headers
        $('#pv_rowkeys_placeholder, #pv_colkeys_placeholder, #pv_filter',$this).sortable(
                { 
                connectWith: '.pv_keys_placeholder'
                ,forcePlaceholderSize: true 
                ,forceHelperSize: true
                ,helper: 'clone'
                ,opacity: '0.6'
                ,placeholder: 'ui-state-default'
                ,tolerance: 'pointer'
                ,cursorAt:  'top,left' 
                ,cursor: 'default'
                ,snap:true
                ,deactivate: function(event, ui){jpv_keys_placeholder_update($this,event, ui)}
                }).disableSelection();
        //create popup filters
        jpv_keys_placeholder_popup($this);
        if ($.isFunction(opts.afterDraw)) opts.afterDraw();
        }

// Public Variables and Methods declare


// Prototype Methods 
;jQuery.fn.jPivot = function(options)
    {
    var jpivot_opts = options; //pass options to each pivot
    return this.each(function() { 
                if (this.pv) return; //this is me, next...
            this.opts = $.extend(true, {}, $.fn.jPivot.defaults, jpivot_opts);
                this.pv={}; //context pivot data            
                jQuery.fn.jPivot.preparePv(this)
                jpv_pivotDrawData(this);
                jpv_pivotDrawData_new(this);
                
                return this;                    
    });        

        }
       
;jQuery.fn.jPivot.preparePv =        function($this)
        {
        // Persistent Context Variables 
        var pv = $this.pv
        var data_length=$this.opts.data.length;
        var data_row_length=$this.opts.data[0].length;
        var data_ptr=$this.opts.data;   
        var rows_ptr=$this.opts.rows;
        var rows_length=$this.opts.rows.length;
        var cols_ptr=$this.opts.cols;    
        var cols_length = $this.opts.cols.length;
        var filter_ptr=$this.opts.filter;
        var filter_length = $this.opts.filter.length;
                
        pv.rows_keys = jpv_create_2Darray(rows_length); //keep unique values for row keys
        pv.cols_keys = jpv_create_2Darray(cols_length);//keep unique values for col keys                

  
            //create sort
         pv.dialog_sort=[];
         for(i=0;i < data_row_length; i++ )
             pv.dialog_sort[i] = $('#pv_dlg_plh'+i+' :radio:checked[name="pv_dlg_plh'+i+'_order"]').val() == 'D' ? 1 : -1;
            //console.profile('sort');
        //sort by rows-cols headers
        data_ptr.sort(function(a,b){return jpv_rowsSort(a,b,$this);});
            //console.profileEnd('sort');
                    
                
        pv.unique_keys=jpv_create_2Darray(data_row_length); //hold unique key values for each key for dialog filter
        pv.dialog_filter=jpv_create_2Darray(data_row_length); //hold dialog filter values for each key
        pv.head_filter=jpv_create_2Darray(data_row_length); //hold head filter values for each key
        pv.keys_index=[];//jpv_create_2Darray(data_row_length);
        for (i=0;i<rows_length;i++) pv.keys_index[rows_ptr[i]]=1; 
        for (i=0;i<cols_length;i++) pv.keys_index[cols_ptr[i]]=2; 
        for (i=0;i<filter_length;i++) pv.keys_index[filter_ptr[i]]=3;
                
        var rows_composite_index=[]; //row key value unique composite indexes
        var cols_composite_index=[]; //col kye value unique composite indexes            
        var data_row2pv_row=[];  //map raw data rows to pivot rows        
        var data_row2pv_col=[];  //map raw data cols to pivot cols    
              
        //create filters indexes
        for(i=0;i < data_row_length; i++ ) //dialog filter
                 $('#pv_dlg_plh'+i+' :checkbox:not(:checked)').each(function(){pv.dialog_filter[i].push($(this).val())})
        for(i=0;i < data_row_length; i++ ) //head filter
                 pv.head_filter[i] = $('#pv_dlg_plh'+i+' select').length > 0 ? $('#pv_dlg_plh'+i+' select').val() : null ;
        /*
        HOW IT WORKS
           example data
              data_rows 
                 ['rk1','rk2','cc1','cc2',v0] is row0
                 ['rk1','rk2','cc1','cc3',v1] is row1
                 ['rk1','rk3','cc1','cc2',v2] is row2
                 
          create maps for data_rows to pivot table rows, find place for data in pivot table row (by cols key)
  
                find map to pivot_row by its rows kews ,we will hold this map in  data_row2pv_row
                in each data_row create composite_index by concatenate rows keys 
                  (
                  row0 and row1  have equal row_composite_index ('rk1~~rk2') and so both mapped to pivot table row 0 
                  row2 have  row_composite_index ('rk1~~rk3') and  so  mapped to pivot table row 1 
                  )
                by columns composite index we determine position of data_row value in pivot row ,we will hold this map in data_row2pv_col
                  (
                  row0 has col_composite_index = 'cc1~~~cc2'  and mapped to column  0 of pivot row 0
                  row1 has col_composite_index = 'cc1~~~cc3'  and mapped to column  1 of pivot row 0
                  row2 has col_composite_index = 'cc1~~~cc2' (same as row0) so mapped to column 0 of pivot row 1   
                  rows indexes obtained above in row_composite_index creation
                  )

          after this we will had this pivot table
                    | cc1 | cc1 |
                    | cc2 | cc3 |
          rk1 | rk2 |  v0 |  v2 |
          rk1 | rk3 |  v2 |     |
          
          as seen in table we have gap (no data) for rk1-rk3-cc1-cc3 keys.
          For those gaps we can't sort data_rows "at once" and must separate sort col_composite_index and create remapping of data_row2pv_col
          
        */
        //console.profile('mainLoop');   
        var composite_row_key,composite_col_key, dc,dr;
        for (dr=0; dr < data_length ; dr++)
            {
            is_filtered=false;
                  //head filter unique keys
            for (i=0;i<filter_length;i++)
                  {
                  //when we first add key to head_fiter we dont have values of this filter (they are creting here)
                  // and <select> is not drawed yet, so we need take first value and use it as filter
                  dc=filter_ptr[i];
                  key=data_ptr[dr][dc];
                  if (pv.head_filter[dc]==null) pv.head_filter[dc] = key;
                  in_array(key,pv.unique_keys[dc],true); //add to uniq keys for using in filters                  
                           if ( (pv.head_filter[dc]!=null) &&  (pv.head_filter[dc]!= key) ) {is_filtered=true;continue;}  //key not allowed (filtered) by head filter                     
                  }                
            composite_row_key=[]; idx=0;
            for (i=0;i<rows_length;i++)
                  {
                  dc=rows_ptr[i];
                  key=data_ptr[dr][dc];
                  in_array(key,pv.unique_keys[dc],true); //add to uniq keys for using in filters                  
                  if ( in_array(key,pv.dialog_filter[dc],false) !==null ) {is_filtered=true;continue;} //key filtered in dialog
                  composite_row_key[idx++]=key;
                  }
                  
            composite_col_key=[];idx=0;
            for (i=0;i<cols_length;i++)
                  {
                  dc=cols_ptr[i];
                  key=data_ptr[dr][dc];
                  in_array(key,pv.unique_keys[dc],true); //add to uniq keys for using in filters                  
                  if ( in_array(key,pv.dialog_filter[dc],false) !==null ) {is_filtered=true;continue;} //key filtered in dialog
                  composite_col_key[idx++]=key;
                  }

              

            if (!is_filtered)
                    {   //create mapping data to pvtable
                    data_row2pv_row[dr]=in_array(composite_row_key.join('~~~'),rows_composite_index,true);
                    data_row2pv_col[dr]=in_array(composite_col_key.join('~~~'),cols_composite_index,true);
                    }
            }
        //console.profileEnd('mainLoop');   
            //console.profile('sortCol');                        
            //sort cols and create remapping 
            var cols_composite_index_remap=[];cols_composite_sorted=[], len=cols_composite_index.length;
            for (i=0; i < len ; i++) cols_composite_sorted[i] = cols_composite_index[i];
            cols_composite_sorted.sort(function(a,b){return jpv_colsSort(a,b,$this);});
            for (i=0; i < len ; i++)
                     {
                     cols_composite_index_remap[i]=in_array(cols_composite_index[i],cols_composite_sorted,false);
                     }
         //console.profileEnd('sortCol');    
         
          //sort unique keys for filters
       len = pv.unique_keys.length;
       for (i=0;i<len;i++)pv.unique_keys[i].sort();
                        
       pv.data_rows_count = rows_composite_index.length; 
       pv.data_row_length = cols_composite_index.length+rows_length;
       pv.data=jpv_create_2Darray(pv.data_rows_count);
       //init pv_data

          var data_header=jpv_create_2Darray(cols_length);
          var use_getData=$.isFunction($this.opts.getData); 
          for (i=0;i<data_length;i++)
              {
              if ( (data_row2pv_row[i]==null) || (data_row2pv_col[i]==null) ) continue; //row filtered
              for (j=0;j<rows_length;j++) 
                      {
                      pv.data[data_row2pv_row[i]][j]=data_ptr[i][rows_ptr[j]]; //fill row keys
                      }
                     /*                      
              if (use_getData)
                 pv.data[data_row2pv_row[i]][cols_composite_index_remap[data_row2pv_col[i]]+rows_length] = $this.opts.getData(i,data_col,data_ptr); //inset data in its place in row
              else
                  pv.data[data_row2pv_row[i]][cols_composite_index_remap[data_row2pv_col[i]]+rows_length] = data_ptr[i][data_col]; //inset data in its place in row
              */
              //store data_ptr index instead of actual value
              //this will be needede on totals an data display functions
              if (pv.data[data_row2pv_row[i]][cols_composite_index_remap[data_row2pv_col[i]]+rows_length]==undefined) pv.data[data_row2pv_row[i]][cols_composite_index_remap[data_row2pv_col[i]]+rows_length]=[];
              pv.data[data_row2pv_row[i]][cols_composite_index_remap[data_row2pv_col[i]]+rows_length].push(i);
              if (data_ptr[i][data_col] != null ) for (c=0;c<cols_length;c++)  data_header[c][cols_composite_index_remap[data_row2pv_col[i]] + rows_length] = data_ptr[i][cols_ptr[c]];
              }
         
        //rows kyes span
        pv.keys_rowspan=jpv_create_2Darray(rows_length);  
        
        for (r=0;r < pv.data_rows_count;r++)    
                for (i=0; i < rows_length; i++)
                   jpv_count_keys_span(pv.keys_rowspan[i],pv.data[r][i])
      
       //create totals
        /* BAD
        pv.rows_totals=jpv_create_2Darray(rows_length);
        for(var cur_rowkey=0;cur_rowkey<rows_length;cur_rowkey++)
              {
              start_row=0;
              pv.rows_totals[cur_rowkey]=[];
              for (var cur_pv_rowspan=0; cur_pv_rowspan < pv.keys_rowspan[cur_rowkey].length; cur_pv_rowspan++)
                    {
                    pv.rows_totals[cur_rowkey][cur_pv_rowspan]=jpv_create_2Darray(pv.data_row_length);
                    for (var cur_pv_col=rows_length; cur_pv_col < pv.data_row_length; cur_pv_col++)
                         {
                         //pv.rows_totals[cur_rowkey][cur_pv_rowspan][cur_pv_col]=[];
                         for (cur_pv_row = start_row; cur_pv_row < start_row+pv.keys_rowspan[cur_rowkey][cur_pv_rowspan][1]; cur_pv_row++)
	                          {
	                          if ( (pv.data[cur_pv_row] != undefined) && (pv.data[cur_pv_row][cur_pv_col]!= undefined) ) 
	                          		pv.rows_totals[cur_rowkey][cur_pv_rowspan][cur_pv_col] = pv.rows_totals[cur_rowkey][cur_pv_rowspan][cur_pv_col].concat(pv.data[cur_pv_row][cur_pv_col])
	                          }
                         start_row +=pv.keys_rowspan[cur_rowkey][cur_pv_rowspan][1];
                         }
                    }
              }
         */     
         function fill_cnt (rw)
         		{
         		for(i = rows_length; i < pv.data_row_length; i++) if (pv.data[rw][i]!= undefined) cnt[i]=cnt[i].concat(pv.data[rw][i]);
         		}
         pv.rows_totals=[];//jpv_create_2Darray(rows_length-1); 
         var cur_rowkey;
        //create rows totals and spans
        var span;
        if (rows_length > 0)
            {
            for (c=0;c<rows_length-1;c++)
                {
                pv.rows_totals[c]=[];cur_rowkey=0
                old=pv.data[0][c]; 
                var cnt=jpv_create_2Darray(pv.data_row_length); 
                fill_cnt(0);
                pv.rows_totals[c][cur_rowkey] =cnt;    
                pv.rows_totals[c][cur_rowkey][0] = span;span=1            
                for (r=1; r < pv.data_rows_count; r++)
                    {
                    if ((old != pv.data[r][c]) || (c>0) && (pv.data[r][c-1]!= null)  )
                        {
                        //save current
                        pv.rows_totals[c][cur_rowkey][0] = span;
                        pv.rows_totals[c][cur_rowkey] =cnt;
                        //prepare new
                        old = pv.data[r][c];
                        pv.rows_totals[c][++cur_rowkey]=[]
                        var cnt=jpv_create_2Darray(pv.data_row_length);     
                        fill_cnt(r)
                        pv.rows_totals[c][cur_rowkey] =cnt;
                        span=1;pv.rows_totals[c][cur_rowkey][0] = span;    
                        continue                     
                        }
                    span++;
                    fill_cnt(r)
                    pv.data[r][c]=null;                     
                    }
                }
            }  
         console.dir(pv.data);
         console.dir(pv.rows_totals);
         var ct;
         //increase rowspans for totlas rows
         //rows_length-1 - do not look at last key - the have not totals
         totals_index = []; for (c=0;c < rows_length-1;c++) totals_index[c]=0;
         for (r=0;r<pv.data_rows_count;r++)
            {
            for (c=rows_length-1-1;c > 0 ;c--) //do not see for first and last -they not add spans for totals
                {
                //if  key is not null, all top (lying left from tis) keys for it total row
                if (pv.data[r][c] != null)
                    {
                    for (ct=c-1 ;ct >=0 ;ct--)
                        pv.rows_totals[c][totals_index[ct]][0]++
                    //next total
                    totals_index[c]++
                    }
                }
            }
        console.dir(pv.rows_totals);
        //cols keys span
        
        pv.keys_colspan=jpv_create_2Darray(cols_length);
        for (r=0; r < cols_length; r++)
                for (c=rows_length; c < pv.data_row_length; c++)                                
                        jpv_count_keys_span(pv.keys_colspan[r],data_header[r][c]);
        //th_row_cnt.push(key,cnt)            
        
        pv.data_header=data_header;
        }

;$.fn.jPivot.defaults=
        {
        data:null
        ,rows:null
        ,cols:null
        ,filter:[]
        ,data_col:null
        ,data_headers:null
        ,printValue:null
        ,printKey:null
        ,getData:null
        ,getTotals:null
        ,afterDraw:null
        }    


//Initialization Code 
$(function() { }); 
})(jQuery);            
