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
            //jpv_pivotDrawData($this);
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
                                //jpv_pivotDrawData($this);
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
                    tstr +='<div id="pv_dlg_plh'+k+'_order">asc<input type="radio" name="pv_dlg_plh'+k+'_order_n" checked value="A">dsc<input type="radio" name="pv_dlg_plh'+k+'_order_n" value="D"></div>'
                    tstr +='<div>total<input type="checkbox" id="pv_dlg_plh'+k+'_total"  value="1"></div>';
                    tstr += '<div id="pv_dlg_plh'+k+'_filter">';
                    for (i=0; i < unique_keys_length; i++)
                          {
                                 printed_key = (use_printKey) ? $this.opts.printKey(k,unique_keys[i]) : unique_keys[i];
                        tstr +=printed_key+'<input type="checkbox" checked value="'+unique_keys[i]+'"><br>'
                        }
                    tstr +='</div></div>';
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
                                        //jpv_pivotDrawData($this);
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
                //jpv_pivotDrawData(this);
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
        pv.totals_mask=[];
        pv.dialog_filter=jpv_create_2Darray(data_row_length); //hold dialog filter values for each key
        pv.head_filter=jpv_create_2Darray(data_row_length); //hold head filter values for each key

        for(i=0;i < data_row_length; i++ )
             pv.dialog_sort[i] = $('#pv_dlg_plh'+i+'_order :radio:checked','#pv_dlg_plh'+i).val() == 'D' ? 1 : -1;
        //create filters indexes
        for(i=0;i < data_row_length; i++ ) //dialog filter
                 $('#pv_dlg_plh'+i+'_filter :checkbox:not(:checked)').each(function(){pv.dialog_filter[i].push($(this).val())})
        for(i=0;i < data_row_length; i++ ) //head filter
                 pv.head_filter[i] = $('#pv_dlg_plh'+i+' select').length > 0 ? $('#pv_dlg_plh'+i+' select').val() : null ;
        for(i=0;i < data_row_length; i++ )
             pv.totals_mask[i] = $('#pv_dlg_plh'+i+'_total').attr('checked') ?  1 : 0;

        //sort by rows-cols headers
        data_ptr.sort(function(a,b){return jpv_rowsSort(a,b,$this);});
            //console.profileEnd('sort');
                    
                
        pv.unique_keys=jpv_create_2Darray(data_row_length); //hold unique key values for each key for dialog filter
        pv.keys_index=[];//jpv_create_2Darray(data_row_length);
        for (i=0;i<rows_length;i++) pv.keys_index[rows_ptr[i]]=1; 
        for (i=0;i<cols_length;i++) pv.keys_index[cols_ptr[i]]=2; 
        for (i=0;i<filter_length;i++) pv.keys_index[filter_ptr[i]]=3;
                
        var rows_composite_index=[]; //row key value unique composite indexes
        var cols_composite_index=[]; //col kye value unique composite indexes            
        var data_row2pv_row=[];  //map raw data rows to pivot rows        
        var data_row2pv_col=[];  //map raw data cols to pivot cols    
              
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
                  //when we first add key to head_fiter (just drag it into hoder) we dont have values of this filter (they are creting here)
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
            //sort cols and create remapping 
            var cols_composite_index_remap=[];cols_composite_sorted=[], len=cols_composite_index.length;
            for (i=0; i < len ; i++) cols_composite_sorted[i] = cols_composite_index[i];
            cols_composite_sorted.sort(function(a,b){return jpv_colsSort(a,b,$this);});
            for (i=0; i < len ; i++)
                     {
                     //find index of cols_composite_index[i]in cols_composite_sorted and map its index
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
          for (i=0;i<data_length;i++)
              {
              if ( (data_row2pv_row[i]==null) || (data_row2pv_col[i]==null) ) continue; //row filtered
              for (j=0;j<rows_length;j++) 
                      {
                      pv.data[data_row2pv_row[i]][j]=data_ptr[i][rows_ptr[j]]; //fill row keys
                      }
              //store data_ptr index instead of actual value
              //this will be needed on totals and data display functions
              if (pv.data[data_row2pv_row[i]][cols_composite_index_remap[data_row2pv_col[i]]+rows_length]==undefined) pv.data[data_row2pv_row[i]][cols_composite_index_remap[data_row2pv_col[i]]+rows_length]=[];
              pv.data[data_row2pv_row[i]][cols_composite_index_remap[data_row2pv_col[i]]+rows_length].push(i);
              if (data_ptr[i][data_col] != null ) 
                  for (c=0;c<cols_length;c++)  
                  {
                    for (var r=0;r < rows_length;r++) data_header[c][r]=null;
                    data_header[c][cols_composite_index_remap[data_row2pv_col[i]] + rows_length] = data_ptr[i][cols_ptr[c]];
                  }
              
              }
         
        //rows kyes span
        pv.keys_rowspan=jpv_create_2Darray(rows_length);  
        
        for (r=0;r < pv.data_rows_count;r++)    
                for (i=0; i < rows_length; i++)
                   jpv_count_keys_span(pv.keys_rowspan[i],pv.data[r][i])
      
       //create rows totals and spans
   
         function fill_cnt (rw)
               {
               for(var i = rows_length; i < pv.data_row_length; i++) if (pv.data[rw][i]!= undefined) cnt[i]=cnt[i].concat(pv.data[rw][i]);
               }
         function init_cnt(rw)
               {
               cnt=[]; for (var i=0; i < pv.data_row_length; i++) cnt[i]=[];
               fill_cnt (rw);
               }
         pv.rows_totals=[];
         var cur_rowkey;
         var span;
         if (rows_length > 1)
            {
            for (c=0;c<rows_length-1;c++)
                {
                pv.rows_totals[c]=[];cur_rowkey=0
                old=pv.data[0][c]; 
                var cnt; init_cnt(0);
                pv.rows_totals[c][cur_rowkey] =cnt;    
                for (r=1; r < pv.data_rows_count; r++)
                    {
                    if ( (old != pv.data[r][c]) || (c>0) && (pv.data[r][c-1]!= null)  )
                        {
                        //save current
                        pv.rows_totals[c][cur_rowkey] =cnt;
                        //prepare new
                        old = pv.data[r][c];
                        var cnt; init_cnt(r); 
                        pv.rows_totals[c][++cur_rowkey] =cnt;
                        continue                     
                        }
                    fill_cnt(r);
                    pv.data[r][c]=null;                     
                    }
                }
            }  

         function fill_cnt_col (col)
               {
               for(var r=0; r < pv.data_rows_count; r++) 
                   if (pv.data[r][col]!= undefined) cnt[r+1]=cnt[r+1].concat(pv.data[r][col]);
               }            
         function init_cnt_col(col)
               {
               cnt=jpv_create_2Darray(pv.data_rows_count+1); 
               fill_cnt_col (col);
               }            
            
         pv.cols_totals=jpv_create_2Darray(cols_length); 
         var cur_colkey=0;
         var span;
         if (cols_length > 1)
            {
            for (r=0;r<cols_length;r++)
                {
                var cnt; init_cnt_col(rows_length);
                pv.cols_totals[r][0]=cnt;
                old=data_header[r][rows_length]; 
                cur_colkey=0;
                for (c=rows_length+1; c < pv.data_row_length; c++)
                    {
                    if ( (old != data_header[r][c]) || (r>0) && (data_header[r-1][c]!= null)  )
                        {
                        pv.cols_totals[r][cur_colkey++]=cnt;
                        var cnt; init_cnt_col(c);
                        pv.cols_totals[r][cur_colkey]=cnt;
                         old = data_header[r][c];
                        continue                     
                        }
                    fill_cnt_col(c);
                    data_header[r][c]=null;                     
                    }
                //last
                }
            }  
          
        pv.data_header=data_header;
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
            var r;var c;
        //create array for table_data
        var td_data_rows_start = 1+col_keys_length;//actual data start 1(row headers here and delimiter) +[col keys count]
        var td_rows_count=td_data_rows_start+pv.data_rows_count;//+ [number of rows with data]; 

        var td_data_cols_start=row_keys_length+1; //  actual data start [rows keys count]+1(cols headers here)
        var td_cols_count=td_data_cols_start+pv.data_row_length-row_keys_length;// + [number of cols with data]; 
        var pv2td_data_col_diff= -row_keys_length+td_data_cols_start
        if (!col_keys_length)
            {
            td_data_rows_start++;td_rows_count++;
            }
        //fill rows
        for (r=0;r < td_rows_count; r++) 
              {
              table_data[r]=[];
              for (c=0;c < td_cols_count; c++) table_data[r][c]=[null,null];
              }
  
        //fill cols header
        for (r=0;r<col_keys_length;r++)
          {   
           for (c=row_keys_length; c < pv.data_row_length; c++)  //loop by pv.data_header[r]
               {
               //table_data[r]=[];
              if (pv.data_header[r][c] != null) 
                  {
                      table_data[r][c+pv2td_data_col_diff]=[pv.data_header[r][c], null];
                  }
              else 
                  table_data[r][c+pv2td_data_col_diff]=[null,null];
              }
          }
          
        //fill rows header and data
        for (r=0;r<pv.data_rows_count;r++)
           {
           //rows keys
           for (c=0; c < row_keys_length; c++)  table_data[r+td_data_rows_start][c]=[pv.data[r][c],null];
           //fill with array of indexes of actual data rows (opts.data)
           for (c=row_keys_length; c < pv.data_row_length; c++)  table_data[r+td_data_rows_start][c+pv2td_data_col_diff]=(pv.data[r][c]==undefined) ? [null,null] : [pv.data[r][c],null]; 
           }


        //ADD row totlas  
           
            function append_total_row(col,key_ind)
                  {
                  table_data[add]=[];
                  for (var c=0; c < td_data_cols_start; c++) table_data[add][c]=[null,null];
                  table_data[add][col]=['&Sigma;','colspan="'+(row_keys_length-col)+'" class="pv_table_total" ']; 
                  for (var c=row_keys_length; c < pv.data_row_length; c++)     
                      table_data[add][c+pv2td_data_col_diff]=[pv.rows_totals[col][key_ind][c],'class="pv_table_total"'];
                  }
            var total_index=[];for (c=row_keys_length-1;c >= 0; c--) total_index[c]=0;
            var total_mask=[]; for (r=0;r<row_keys_length;r++) total_mask[r]=pv.totals_mask[opts.rows[r]];
            var td_rows_map=[]; for (r=0;r<td_data_rows_start+1;r++) td_rows_map[r]=[r,null]; //map headers and first data row -they not have totals before
            var r_index=td_data_rows_start+1;
            var add=td_rows_count;
            
            for (r=td_data_rows_start+1;r<td_rows_count;r++)
                  {
                  for (c=row_keys_length-1-1;c >= 0; c--)
                      {//check if we had any totals for this col
                      if ( (table_data[r][c][0] != null) &&  (total_mask[c]) )
                          {//we need to add total BEFORE current data row, because we hold total_index on previous keys
                          append_total_row(c,total_index[c]++)
                          td_rows_map[r_index++]=[null,add++];
                          }
                      }
                  td_rows_map[r_index++]=[r,null];
                  }
            //last row is total; these is quicker then additional checks in mail loop;
            for (c=row_keys_length-1-1;c >= 0; c--) {if (total_mask[c]) {append_total_row(c,total_index[c]++);td_rows_map[r_index++]=[null,add++];}}
            td_rows_count = add;
            
            //create row spans
             var r_index; var span; var rn; var is_tot;
             for (c=row_keys_length-1-1;c >= 0; c--)
                {
               	do_span=0;is_tot=0;span=1;r_index=td_rows_map[td_data_rows_start][0]; //point to the first row with data - it always have keys.
                for (r=td_data_rows_start+1;r<td_rows_count;r++)
                    {
                    rn= td_rows_map[r][0] != null ? td_rows_map[r][0] : td_rows_map[r][1];
                    //look left if we had header or total
                    for (var j = c; j >=0; j--)
                    	if (table_data[rn][j][0] != null) 
                    		{
                        if (!is_tot) table_data[r_index][c]=[table_data[r_index][c][0],'rowspan='+span];
                        r_index = rn; 
                        is_tot= td_rows_map[r][0] != null ? 0 : 1; //do not create rowspan for totals
                        span=0;
                        break;
                        }
                        span++
                    }
                    if (!is_tot) table_data[r_index][c]=[table_data[r_index][c][0],'rowspan='+span];
                }
            
           
           
          //  Create col mappings and append cols totals
            function append_total_col(key_ind)
                {
                var tot_index=1; var rn;
                for (var r=0;r < td_rows_count; r++)
                    {
                    rn=(td_rows_map[r][0]!= null) ? td_rows_map[r][0] : td_rows_map[r][1];
                    if (r < td_data_rows_start )
                      {
                      if (r == tc) 
                          table_data[rn][add]=['&Sigma','rowspan="'+(col_keys_length-tc)+'"class="pv_table_total" ' ];
                      else
                          table_data[rn][add]=[null,null]
                      }
                    else
                      {
                      if(td_rows_map[r][0]==null) //totals intrsect
                          table_data[rn][add]=[[],'style="background-color:yellow"']; // this is  total row - add empty                      
                      else
                          table_data[rn][add]=[pv.cols_totals[tc][key_ind][tot_index++],'class="pv_table_total" ' ];                          
                      }
                    }
                }

            var td_cols_map=[];// hold maps of cols with data and totals cols;
            var key_i_group=[]; for (c=0;c < col_keys_length-1-1;c++) key_i_group[c]=0 //current totals index
            for (c=0;c < td_data_cols_start; c++) td_cols_map[c]=[c,null]; //skip headers and first rows;
            var ind = td_data_cols_start; //hold current map index
            var add = td_cols_count; //number of added rows
            var total_mask=[]; for (r=0;r<col_keys_length;r++) total_mask[r]=pv.totals_mask[opts.cols[r]];
            for (c=0;c < col_keys_length-1;c++) key_i_group[c]=0 //current totals index
            for (c=td_data_cols_start;c<td_cols_count;c++) //loop by columns
                {
                for (var tc=col_keys_length -1-1; tc >= 0; tc-- ) //loop by col keys ROWS
                    {
                    if ((total_mask[tc]) && (table_data[tc][c][0] != null))
                        {
                        if (c != td_data_cols_start)
                            { 
                            append_total_col(key_i_group[tc]++)
                            td_cols_map[ind++]=[null,add++];
                            }
                        }
                    }
                td_cols_map[ind++]=[c,null];
                }
            //lastcol is last totals
            for (var tc=col_keys_length -1-1; tc >= 0; tc-- )
            		if (total_mask[tc]) 
                            { 
                            append_total_col(key_i_group[tc]++)
                            td_cols_map[ind++]=[null,add++];
                            }            
           td_cols_count = ind;
           
            //create col spans
             var c_index; var cn;
             for (r=td_data_rows_start-1-1 ;r >= 0; r--) //skip delimeter, skip last colkeys row
             	{
             	//header rows mapped 'as is' - whe don't need use td_rows_map;
             	is_tot=0;span=1;c_index=td_cols_map[td_data_cols_start][0]; //point to the first col with data - it always have keys.
             	for (c=td_data_cols_start+1;c < td_cols_count; c++) 
             			{
                    cn= td_cols_map[c][0] != null ? td_cols_map[c][0] : td_cols_map[c][1]; 
                    for(var j=r; j >=0; j--) //look top if we had header or total
                    	if (table_data[j][cn][0] != null)
                     		{
                        if (!is_tot) table_data[r][c_index]=[table_data[r][c_index][0],'colspan='+span];
                        c_index = cn; 
                        is_tot= td_cols_map[c][0] != null ? 0 : 1; //do not create rowspan for totals
                        span=0;
                        break;
                        }                    	
                        span++
                  }
                  if (!is_tot) table_data[r][c_index]=[table_data[r][c_index][0],'colspan='+span]; //las col            				
               }
           
        var col_drag = col_keys_length ? '' : 'style="padding-bottom:10px;"'; //fix for empty colheader
        col_drag='<ul class="pv_keys_placeholder" '+col_drag+' id="pv_colkeys_placeholder">';
        for (i=0;i<col_keys_length;i++) 
            col_drag +='<li id="pv_key_header'+opts.cols[i]+'" value="'+opts.cols[i]+'" class="ui-state-highlight">'
                  +'<span style="float:right;" class="ui-icon '+(pv.dialog_sort[opts.cols[i]] > 0  ? 'ui-icon-triangle-1-s ' : 'ui-icon-triangle-1-n' )+' "></span>'
                  +opts.data_headers[opts.cols[i]] 
                  +'</li>';
        col_drag +='</ul>';
        //row dragables
            var row_drag = '<ul class="pv_keys_placeholder" id="pv_rowkeys_placeholder">';
            for (i=0;i< row_keys_length ;i++) 
                  row_drag +='<li id="pv_key_header'+opts.rows[i]+'" value="'+opts.rows[i]+'" class="ui-state-highlight">'
                            +'<span style="float:right;" class="ui-icon '+(pv.dialog_sort[opts.rows[i]] > 0  ? 'ui-icon-triangle-1-s ' : 'ui-icon-triangle-1-n' )+' "></span>'
                            +opts.data_headers[opts.rows[i]]
                            +'</li>';
            row_drag +='</ul>';
            
            
        //Actual print
           var  ck = col_keys_length ? col_keys_length : 1;

           table_data[0][0]=['00','colspan="'+row_keys_length+'" rowspan="'+ck+'"'];
           table_data[0][1]=[col_drag,' rowspan="'+ck+'" class="ui-state-default" style="min-width:40px;"'];
           if (col_keys_length==0) table_data[0][2]=['55',null];
           table_data[ck][0]=[row_drag,' colspan="'+row_keys_length+'"'];
           table_data[ck][1]=['vd','rowspan="'+(td_rows_count-col_keys_length)+'"'];
           table_data[ck][2]=['hd','colspan="'+(td_cols_count-row_keys_length)+'"'];
           
           
           var td_print=[]; var val; var param;
           var col_index;
           var newv=1;
           for (r=0;r < td_rows_count; r++)
                 {
                 tr=[]; col_index=0;
                 for (c=0; c < td_cols_count  ; c++)
                     {
                     rn=(td_rows_map[r][0]!= null) ? td_rows_map[r][0] : td_rows_map[r][1];
                     cn=(td_cols_map[c][0]!= null) ? td_cols_map[c][0] : td_cols_map[c][1];
                     if ((r >= td_data_rows_start) && (c >= td_data_cols_start))
                          {// data
                          if ( (td_rows_map[r][0]!= null) && (td_cols_map[c][0]!= null) )
                              val = opts.printValue(table_data[rn][cn][0]);
                          else if ( (td_rows_map[r][0]== null) && (td_cols_map[c][0]== null) )
                              val= opts.printTotalIntersect();
                          else if (td_rows_map[r][0]== null) 
                              val = opts.printTotalRowValue(table_data[rn][cn][0]);
                          else if (td_cols_map[c][0]== null) 
                              val = opts.printTotalColValue(table_data[rn][cn][0]);
                          else 
                               val = opts.printTotalColValue(table_data[rn][cn][0]); //intersect of totals
                          }
                     else  
                          {
                          if (table_data[rn][cn][0] == null) continue; //skip  empty cell
                          val = opts.printKey(c,table_data[rn][cn][0]);
                          }

                     param = table_data[rn][cn][1] != null ? table_data[rn][cn][1] : ''
                     tr[col_index++] = '<td '+param+'>'+val+'</td>';
                     }
                 td_print[r]='<tr>'+tr.join(' ')+'</tr>';
                 }
           var str  = '<div>flt<ul class="pv_keys_placeholder" id="pv_filter"></ul></div><br><br>';
               str += '<table  class="pv_table">'+td_print.join(' ')+'</table>';
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
    //console.dir (pv.cols_totals)
            
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
