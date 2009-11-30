(function($) { 
// Private Variables and Functions
var  jpv_keys_placeholder_update_list_cnt=0; 
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
len =array.length
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
  
function jpv_create_2Darray(len)
        {
        var a=[];
        for (var i=0;i<len;i++) a[i]=[];
        return a;
        }        
function jpv_OnCreateManage($this)
          {
          var opts=$this.opts;
          var pv=$this.pv;
          var i;
          var t;

          var col_drag = pv.col_keys_length ? '' : 'style="padding-bottom:10px;"'; //fix for empty colheader
          col_drag='<ul '+opts.styles.KeysColsPlaceholder+' '+col_drag+' id="pv_col_keys_list">';
          for (i=0;i<pv.col_keys_length;i++) 
              col_drag +='<li id="pv_key_header'+opts.cols[i]+'" value="'+opts.cols[i]+'" class="ui-state-highlight">'
                    +'<span style="float:right;" class="ui-icon '+(pv.dialog_sort[opts.cols[i]] > 0  ? 'ui-icon-triangle-1-s ' : 'ui-icon-triangle-1-n' )+' "></span>'
                    +opts.data_headers[opts.cols[i]] 
                    +'</li>';
          col_drag +='</ul>'; 

        //row dragables
        var row_drag = '<ul id="pv_row_keys_list">';
        for (i=0;i< pv.row_keys_length ;i++) 
              row_drag +='<li id="pv_key_header'+opts.rows[i]+'" value="'+opts.rows[i]+'" class="ui-state-highlight">'
                        +'<span style="float:right;" class="ui-icon '+(pv.dialog_sort[opts.rows[i]] > 0  ? 'ui-icon-triangle-1-s ' : 'ui-icon-triangle-1-n' )+' "></span>'
                        +opts.data_headers[opts.rows[i]]
                        +'</li>';
        row_drag +='</ul>';  
        var agregate_drag = '<ul id="pv_agregate">';
        for (k=0;k<opts.agregate.length;k++)
            agregate_drag +='<li  value="'+opts.agregate[k]+'" class="ui-state-default">'+opts.data_headers[opts.agregate[k]]+'</li> ';
        agregate_drag += '</ul>';
        var filter_drag = '<ul id="pv_filter">';        
        for (k=0;k<opts.filter.length;k++)
            {
            t=opts.filter[k];
            filter_drag +='<li value="'+t+'">'
            filter_drag +=opts.data_headers[t]+'<select>';
            for (i=0; i < pv.unique_keys[t].length; i++)
              if (pv.unique_keys[t][i] == pv.head_filter[t])
                filter_drag += '<option selected value="'+pv.unique_keys[t][i]+'">'+pv.unique_keys[t][i]+'</option>';
              else
                filter_drag += '<option value="'+pv.unique_keys[t][i]+'">'+pv.unique_keys[t][i]+'</option>';
            filter_drag +='</select></li>';
            }
            
        filter_drag += '</ul>';        
        
        
            $('#'+opts.filter_keys_placeholder)
                .empty()
                .append(filter_drag)
                .addClass(opts.styles.FliterPlaceholder);
            if ($this.opts.immediate_draw)
                $('#'+opts.filter_keys_placeholder+' select').bind(
                            "change"
                            ,function(e) 
                                {
                                jpv_preparePv($this);
                                $this.opts.OnDrawData($this);
                                }
                             ); 

            $('#'+opts.agregate_keys_placeholder).empty().append(agregate_drag).addClass(opts.styles.AgregatePlaceholder);
            $('#'+opts.col_keys_placeholder).empty().append(col_drag).addClass(opts.styles.KeysColsPlaceholder);
            $('#'+opts.row_keys_placeholder).empty().append(row_drag).addClass(opts.styles.KeysRowsPlaceholder);
            $('#pv_row_keys_list, #pv_col_keys_list, #pv_agregate, #pv_filter')
                  .addClass('pv_connectWith')
                  .sortable(
                    { 
                    connectWith: '.pv_connectWith'
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
              
          }
        
function jpv_keys_placeholder_update($this, event, ui)
        {
        //this func called for each lists (we have 4) so wait until last 
        if (jpv_keys_placeholder_update_list_cnt++ > 2) 
            {
            var rows=[]; var cols=[]; var filter=[]; var agregate=[];
            $('li','#pv_col_keys_list').each(
                    function () 
                        { 
                        cols.push($(this).attr('value')) 
                        }
                    );
            $('li','#pv_row_keys_list').each(
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
            $('li','#pv_agregate').each(
                    function () 
                        { 
                        agregate.push($(this).attr('value')) 
                        }
                    )    ;                                                
            jpv_keys_placeholder_update_list_cnt=0;
            $this.opts.cols=cols;
            $this.opts.rows=rows;
            $this.opts.filter=filter;
            $this.opts.agregate=agregate;
            if ($this.opts.immediate_draw) {jpv_preparePv($this);$this.opts.OnDrawData($this);}
            }
        }    
function jpv_keys_placeholder_popup($this)
        {
        var opts = $this.opts;
        var pv = $this.pv;
        //var keys_index=$this.pv.keys_index;
        //var keys_index_length=$this.pv.keys_index.length;
        var keys_index_length = pv.unique_keys.length
        var data_headers = opts.data_headers;
        var tstr=''; var t1; var t2;
        for (k=0;k<keys_index_length;k++)
            {
            unique_keys=pv.unique_keys[k];
            unique_keys_length=pv.unique_keys[k].length;
            if ( (unique_keys == null) ||  (unique_keys_length == 0) )
                {
                $('#pv_dlg_plh'+k).remove(); //remove placeholder
                continue;    
                }
                //is the dialog for col and row headers
                if (pv.dialog_filter[k].length > 0) //we have filtered keys - show this
                		$('#pv_key_header'+k).addClass(opts.styles.class_add_KeyHeaderFiltered);
                if ($('#pv_dlg_plh'+k).length == 0) //if dialog not created
                    { //we have no dialog,create
                    tstr='<div id="pv_dlg_plh'+k+'" style="display:none">';
                    tstr +='<div id="radio_order">asc<input type="radio" checked name="radio_order'+k+'"  value="A"/>'
                    tstr +='dsc<input type="radio" name="radio_order'+k+'"   value="D"></div>'
                    tstr +='<div>total<input type="checkbox" name="total"  value="1"></div>';
                    tstr += '<div id="filter">';
                    for (i=0; i < unique_keys_length; i++)
                        tstr +='<input type="checkbox" checked value="'+opts.printKey(k,unique_keys[i])[0]+'">'+opts.printKey(k,unique_keys[i])[0]+'<br>'
                    tstr +='</div></div>';
                    $($this).append(tstr);
                    $('#pv_dlg_plh'+k).dialog
                            ({
                            autoOpen:false
                         ,title:opts.data_headers[k]
                         ,dialogClass:'pv_dialog'
                         ,buttons: {
                                    Ok: function() 
                                        {
                                        if ($this.opts.immediate_draw) {jpv_preparePv($this);$this.opts.OnDrawData($this);}
                                        $(this).dialog('close');
                                        }
                                    ,Cancel: function() 
                                        {
                                        $(this).dialog('close');
                                        }
                                    }
                                            
                            });
                    }
                  //bind click event, we must rebind for each time in case header was restored from agregate or filter state
                  $('#pv_key_header'+k).bind
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
               
function jpv_restoreHeaderData($this)
    {
    //restore keys fields in pv.data after jpv_nullifyHeaderData
    var pv = $this.pv;
    var old;
    for (var c=0;c<pv.row_keys_length;c++)
      {
      old=null;
      for (var r=pv.col_keys_length; r < pv.data_rows_count; r++)
        {
        if (pv.data[r][c] != null) old=pv.data[r][c];
        pv.data[r][c] = old;
        }
      }
    for (var r=0;r<pv.col_keys_length;r++)
      {
      old=null;
      for (var c=pv.row_keys_length; c < pv.data_row_length; c++)
        {
        if (pv.data[r][c] != null) old=pv.data[r][c];
        pv.data[r][c] = old;
        }
      }      
    }	
function jpv_nullifyHeaderData($this)
    {
    //nullify repeated keys fields in pv.data for spans an totals
    var pv = $this.pv;
    var old;
    for (c=0;c<pv.row_keys_length-1;c++)
        {
        old=pv.data[pv.col_keys_length][c]; 
        for (r=pv.col_keys_length+1; r < pv.data_rows_count; r++)
            if ( (old != pv.data[r][c]) || (c>0) && (pv.data[r][c-1]!= null)  )
              old = pv.data[r][c];
            else
              pv.data[r][c]=null;                     
        }  

    for (r=0;r<pv.col_keys_length;r++)
        {
        old=pv.data[r][pv.row_keys_length]; 
        for (c=pv.row_keys_length+1; c < pv.data_row_length; c++)
            {
            if ( (old != pv.data[r][c]) || (r>0) && (pv.data[r-1][c]!= null)  )
              old = pv.data[r][c];
            else
              pv.data[r][c]=null;                     
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
                this.drawData = function(){this.opts.OnDrawData(this)}
                this.getDataForExcel = function(){this.opts.getDataForExcel(this)}
                this.preparePv = function(){jpv_preparePv(this)}
                this.pv={}; //context pivot data 
                this.opts.pivot_data = this.pv ;// ptr to context pivot data     
                jpv_preparePv(this)
                if (this.opts.immediate_draw) this.opts.OnDrawData(this);
                return this;                    
    });        

        }
;jQuery.fn.jPivot_preparePv =        function($this)
      {
      return this.each(function() { 
                  jpv_preparePv(this);
                  return this;                    
      });         
      }
				
function jpv_preparePv($this)
        {
        // Persistent Context Variables 
        var pv = $this.pv
        var data_length=$this.opts.data.length;
        var data_row_length=$this.opts.data[0].length;
        var data_ptr=$this.opts.data;   
        var rows_ptr=$this.opts.rows;
        var row_keys_length=$this.opts.rows.length;
        var cols_ptr=$this.opts.cols;    
        var col_keys_length = $this.opts.cols.length;
        var filter_ptr=$this.opts.filter;
        var filter_length = $this.opts.filter.length;
                
        pv.head_filter=$this.opts.getHeadFilter(data_row_length);//=jpv_create_2Darray(data_row_length); //hold head filter values for each key
        pv.dialog_filter=$this.opts.getDialogFilter(data_row_length); //hold dialog filter values for each key
				pv.dialog_sort=$this.opts.getSort(data_row_length); //sort direction for each data index
				
				//for resoring state (not data) we need serialize
				// rows_ptr,cols_ptr,filter_ptr, agregate(not holded in Jpivot)
				// head_filter,dialog_filter,dialog_sort
				
				
        //////////////// datt processing /////////////////				
				//sort
        data_ptr.sort(function(a,b){return jpv_rowsSort(a,b,$this);});
        pv.unique_keys=jpv_create_2Darray(data_row_length); //hold unique key values for each key for dialog filter

                
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
            if ($this.opts.getCustomFilter(dr)) continue;
            for (i=0;i<filter_length;i++)
                  {
                  //when we first add key to head_fiter (just drag it into hoder) we dont have values of this filter (they are creting here)
                  // and <select> is not drawed yet, so we need take first value and use it as filter
                  dc=filter_ptr[i];
                  key=data_ptr[dr][dc];
                  if (pv.head_filter[dc]==null) pv.head_filter[dc] = key;
                  in_array(key,pv.unique_keys[dc],true); //add to uniq keys for using in filters                  
                  if (pv.head_filter[dc]!= key) {is_filtered=true;}  //key not allowed (filtered) by head filter , continue to add all possible values to filter                  
                  }  
            if (is_filtered)  continue; //do not  continue to add all possible values to dialog_filter 
                          
            composite_row_key=[]; idx=0;
            for (i=0;i<row_keys_length;i++)
                  {
                  dc=rows_ptr[i];
                  key=data_ptr[dr][dc];
                  in_array(key,pv.unique_keys[dc],true); //add to uniq keys for using in filters                  
                  if ( in_array(key,pv.dialog_filter[dc],false) !=null ) {is_filtered=true;continue;} //key not allowed (filtered)  in dialog, continue to add all possible values to filter 
                  composite_row_key[idx++]=key;
                  }
            composite_col_key=[];idx=0;
            for (i=0;i<col_keys_length;i++)
                  {
                  dc=cols_ptr[i];
                  key=data_ptr[dr][dc];
                  in_array(key,pv.unique_keys[dc],true); //add to uniq keys for using in filters                  
                  if ( in_array(key,pv.dialog_filter[dc],false) !=null ) {is_filtered=true;continue;} //key not allowed (filtered)  in dialog
                  composite_col_key[idx++]=key;
                  }
                  
                  
            if (!is_filtered)
                    {   //create mapping data to pvtable
                    data_row2pv_row[dr]=in_array(composite_row_key.join('~~~'),rows_composite_index,true)+col_keys_length; //shift down by cols keys rows
                    data_row2pv_col[dr]=in_array(composite_col_key.join('~~~'),cols_composite_index,true);
                    }
            }
            //sort cols and create remapping 
            var cols_composite_index_remap=[];cols_composite_sorted=[]; len=cols_composite_index.length;
            for (i=0; i < len ; i++) cols_composite_sorted[i] = cols_composite_index[i];
            cols_composite_sorted.sort(function(a,b){return jpv_colsSort(a,b,$this);}); 
            //find index of cols_composite_index[i]in cols_composite_sorted and map its index
            for (i=0; i < len ; i++)
               cols_composite_index_remap[i]=in_array(cols_composite_index[i],cols_composite_sorted,false);
         
          //sort unique keys for filters
       len = pv.unique_keys.length;
       for (i=0;i<len;i++)pv.unique_keys[i].sort();
                        
       pv.data_rows_count = rows_composite_index.length+col_keys_length; //rows count+col headers rows
       pv.data_row_length = cols_composite_index.length+row_keys_length;
       pv.data=jpv_create_2Darray(pv.data_rows_count);
       //init pv_data
          var rn; var cn;
          for (i=0;i<data_length;i++)
              {
              rn=data_row2pv_row[i]; //data row mapped to rn pv.data row
              if ( (rn==null) || (data_row2pv_col[i]==null) ) continue; //row filtered, so it not mapped
              for (j=0;j<row_keys_length;j++) 
                      pv.data[rn][j]=data_ptr[i][rows_ptr[j]]; //fill row keys
              //store data_ptr index instead of actual value
              //this will be needed on totals and data display functions
              cn=cols_composite_index_remap[data_row2pv_col[i]]+row_keys_length; //data row mapped to cn pv.data col
              if (typeof pv.data[rn][cn] == 'undefined') pv.data[rn][cn]=[];
              pv.data[rn][cn].push(i); //add data row index to value
              if (data_ptr[i][data_col] != null ) 
                  for (c=0;c<col_keys_length;c++)  
                  {
                    for (var r=0;r < row_keys_length;r++) pv.data[c][r]=null;
                    pv.data[c][cn] = data_ptr[i][cols_ptr[c]];
                  }
              }
              
              
        pv.col_keys_length = col_keys_length;
        pv.row_keys_length = row_keys_length;              
         //console.dir(pv.data);

      
        //create rows totals and spans
        // contaln array wih values of pv.data cel
        //save pv.data cells to totals
        //save with undefined 
        // links and count of  cells wiil be needed by statistics functions ( MIN for exmple)           
   				jpv_nullifyHeaderData($this)
         var cur_key;
         		
        pv.rows_totals=jpv_create_2Darray(row_keys_length);
        function fill_cnt (rw)
               {
               for(var i = row_keys_length; i < pv.data_row_length; i++) 
               				 pv.rows_totals[c][cur_key][i].push(pv.data[rw][i])
               }
        if (row_keys_length > 1)
            {
            for (c=0;c<row_keys_length-1;c++)
                {
		            cur_key=0
		            pv.rows_totals[c][cur_key]=jpv_create_2Darray(pv.data_row_length);//hold ptr to array with totals
		            fill_cnt(col_keys_length)
                for (r=col_keys_length+1; r < pv.data_rows_count; r++)
                		{
                		if (pv.data[r][c]!= null) 
                        pv.rows_totals[c][++cur_key] =jpv_create_2Darray(pv.data_row_length);
                		fill_cnt(r);
                		}
                }
            }         

         pv.cols_totals=jpv_create_2Darray(col_keys_length); 
         function fill_cnt_col (col)
               {
               for(var i=col_keys_length; i < pv.data_rows_count; i++) 
                     pv.cols_totals[r][cur_key][i].push(pv.data[i][col]);
               }            
         if (col_keys_length > 1)
            {
            for (r=0;r<col_keys_length-1;r++)
                {
                cur_key=0;
                pv.cols_totals[r][0]= jpv_create_2Darray(pv.data_rows_count);//hold ptr to array with totals
                fill_cnt_col(row_keys_length)
                for (c=row_keys_length+1; c < pv.data_row_length; c++)
                    {
                    if (pv.data[r][c]!= null)
                        pv.cols_totals[r][++cur_key]=jpv_create_2Darray(pv.data_rows_count)
                    fill_cnt_col(c);
                    }
                }
            }  
         //Grand totals
         pv.grand_totals_row=jpv_create_2Darray(pv.data_rows_count);
         pv.grand_totals_col=jpv_create_2Darray(pv.data_row_length);
         for(c=row_keys_length; c < pv.data_row_length; c++  )
            for (r=col_keys_length; r < pv.data_rows_count; r++)
               {
              //if (pv.data[r][c]!= null)  
              pv.grand_totals_row[r].push(pv.data[r][c]);
              pv.grand_totals_col[c].push(pv.data[r][c]);
               }
         console.dir(pv.grand_totals_rows);
           console.dir(pv.grand_totals_cols);
        //$this.opts.pivot_data = pv; 

        }
    
;jQuery.fn.jPivot_drawData =        function()   
    {
    return this.each(function() { 
                this.opts.OnDrawData(this);
                return this;                    
    });        

    }       

function jpv_pivotDrawData($this)
        {
        jpv_nullifyHeaderData($this);
        //return;
      //draw data
      //start header draw
        var table_data=[];
        var opts=$this.opts;
        var pv=$this.pv;
        var filter_length= opts.filter.length;
        var row_keys_length=pv.row_keys_length;
            row_keys_length= (!row_keys_length) ? 1 : row_keys_length; //fix when no row keys, reserve place for key header placeholder
        var col_keys_length=pv.col_keys_length;
            
        //temp vars
            var r;var c;
        //create array for table_data
        var td_data_rows_start = 1+col_keys_length;//actual data start 1(row headers here and delimiter) +[col keys count]
        var td_rows_count=pv.data_rows_count+1;//+ [number of rows +1 for horizontal delimiter]; 

        var td_data_cols_start=row_keys_length+1; //  actual data start [rows keys count]+1(cols headers here)
        var td_cols_count=td_data_cols_start+pv.data_row_length-row_keys_length;// + [number of cols with data]; 
        var pv2td_data_col_diff= -row_keys_length+td_data_cols_start

       var tdr=0; var tdc=0;
       if (!col_keys_length) 
          {
          table_data[tdr]=[]; for (c=0;c<pv.data_row_length+1;c++)table_data[tdr][tdc++]=[null,null]; tdr++; //add fake header if no  col keys
          tdc=0; table_data[tdr]=[]; for (c=0;c<pv.data_row_length+1;c++)table_data[tdr][tdc++]=[null,null]; tdr++; //add horiz delimiter here (in loop below condition is always false)
          td_rows_count++;
          td_data_rows_start++;
          } 
       for (r=0;r<pv.data_rows_count;r++)
           {
           tdc=0;table_data[tdr]=[];
           if ( tdr==col_keys_length ) {for (c=0;c<pv.data_row_length+1;c++)table_data[tdr][tdc++]=[null,null]; tdr++; tdc=0;table_data[tdr]=[];} //skip horizontal delimiter
           //rows keys
           for (c=0;c<pv.data_row_length;c++)
               {
               if (c==row_keys_length) table_data[tdr][tdc++]=[null,null] //skip vertical delimiter
               table_data[tdr][tdc++] = [pv.data[r][c], null]
               }
           tdr++;
           }              

        //ADD row totlas  
          var totals_mask=opts.getTotasMask(opts.data.length);
            function append_total_row(col,key_ind)
                  {
                  table_data[add]=[];
                  for (var c=0; c < td_data_cols_start; c++) table_data[add][c]=[null,null];
                  table_data[add][col]=['&Sigma;','colspan="'+(row_keys_length-col)+'"']; 
                  for (var c=row_keys_length; c < pv.data_row_length; c++)     
                      table_data[add][c+pv2td_data_col_diff]=[pv.rows_totals[col][key_ind][c],'class="pv_table_total"'];
                  }
            var total_index=[];for (c=row_keys_length-1;c >= 0; c--) total_index[c]=0;
            var total_mask=[]; for (r=0;r<row_keys_length;r++) total_mask[r]=totals_mask[opts.rows[r]];
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
            //td_rows_count = add++;
            //add grand total row (totals by column)
                  table_data[add]=[];
                  for (var c=0; c < td_data_cols_start; c++) table_data[add][c]=[null,null];
                  table_data[add][0]=['GT','colspan="'+(row_keys_length)+'"']; 
                  for (var c=row_keys_length; c < pv.data_row_length; c++)     
                      table_data[add][c+pv2td_data_col_diff]=[pv.grand_totals_col[c],'class="pv_table_total"'];
                  td_rows_map[r_index++]=[null,add++];
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
                        if (!is_tot) table_data[r_index][c]=[table_data[r_index][c][0],'rowspan="'+span+'"'];
                        r_index = rn; 
                        is_tot= td_rows_map[r][0] != null ? 0 : 1; //do not create rowspan for totals
                        span=0;
                        break;
                        }
                        span++
                    }
                    if (!is_tot) table_data[r_index][c]=[table_data[r_index][c][0],'rowspan="'+span+'"'];
                }
            
           
           
          //  Create col mappings and append cols totals
            function append_total_col(key_ind)
                {
                var tot_index=col_keys_length; var rn;
                for (var r=0;r < td_rows_count; r++)
                    {
                    rn=(td_rows_map[r][0]!= null) ? td_rows_map[r][0] : td_rows_map[r][1];
                    if (r < td_data_rows_start )
                      {
                      if (r == tc) 
                          table_data[rn][add]=['&Sigma;','rowspan="'+(col_keys_length-tc)+'"' ];
                      else
                          table_data[rn][add]=[null,null]
                      }
                    else
                      {
                      if(td_rows_map[r][0]==null) //totals intrsect
                          table_data[rn][add]=[[],null]; // this is  total row - add empty                      
                      else
                          table_data[rn][add]=[pv.cols_totals[tc][key_ind][tot_index++],''];                          
                      }
                    }
                }
                
            var td_cols_map=[];// hold maps of cols with data and totals cols;
            var key_i_group=[]; for (c=0;c < col_keys_length-1-1;c++) key_i_group[c]=0 //current totals index
            for (c=0;c < td_data_cols_start; c++) td_cols_map[c]=[c,null]; //skip headers and first rows;
            var ind = td_data_cols_start; //hold current map index
            var add = td_cols_count; //number of added rows
            var total_mask=[]; for (r=0;r<col_keys_length;r++) total_mask[r]=totals_mask[opts.cols[r]];
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
            //add grand total col (totals by row)                                       
                var rn; tc=pv.col_keys_length;
                for (var r=0;r < td_rows_count; r++)
                    {
                    rn=(td_rows_map[r][0]!= null) ? td_rows_map[r][0] : td_rows_map[r][1];
                    if (r < td_data_rows_start )
                      {
                      if (r == 0) 
                          table_data[rn][add]=['GT','rowspan="'+(col_keys_length)+'"' ];
                      else
                          table_data[rn][add]=[null,null]
                      }
                    else
                      {
                      if(td_rows_map[r][0]==null) //totals intrsect
                          table_data[rn][add]=[[],null]; // this is  total row - add empty                      
                      else
                          table_data[rn][add]=[pv.grand_totals_row[tc++],''];                          
                      }
                    }  
               td_cols_map[ind++]=[null,add++];          
               //end grand total col 
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
                        if (!is_tot) table_data[r][c_index]=[table_data[r][c_index][0],'colspan="'+span+'"'];
                        c_index = cn; 
                        is_tot= td_cols_map[c][0] != null ? 0 : 1; //do not create rowspan for totals
                        span=0;
                        break;
                        }                    	
                        span++
                  }
                  if (!is_tot) table_data[r][c_index]=[table_data[r][c_index][0],'colspan="'+span+'"']; //las col            				
               }
           


            
            
        //Actual print
           var  ck = col_keys_length ? col_keys_length : 1;
           table_data[0][0]=[opts.TableTitle,'colspan="'+row_keys_length+'" rowspan="'+ck+'"'];
           //Cols headers
           if (opts.ExternalManage)
              {
              if (col_keys_length==0) {table_data[0][2]=['Val',null];table_data[0][1]=['',null];}
              for(i=0; i < col_keys_length; i++) table_data[i][1] = opts.printKeyHeader(c,opts.data_headers[opts.cols[c]]);
              for(i=0; i < row_keys_length; i++) table_data[ck][i] = opts.printKeyHeader(c,opts.data_headers[opts.rows[c]])
              table_data[ck][i++]=['','rowspan="'+(td_rows_count-col_keys_length)+'"'];
              table_data[ck][i++]=['','colspan="'+(td_cols_count-row_keys_length-1)+'"'];              
              }
           else  
              {
              table_data[0][1]=['CKP',' rowspan="'+ck+'" id="'+opts.col_keys_placeholder+'" style="min-width:40px;"'];
              table_data[ck][0]=['RKP',' id="'+opts.row_keys_placeholder+'" colspan="'+row_keys_length+'"'];
              table_data[ck][1]=['','rowspan="'+(td_rows_count-col_keys_length)+'"'];
              table_data[ck][2]=['','colspan="'+(td_cols_count-row_keys_length)+'"'];
              if (col_keys_length==0) table_data[0][2]=['55',null];
              }
           
           
           
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
                     param='';
                                                     
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
                          if ((r==0) && (c==0))
                          	{
                          	val=opts.printTopLeft();
                          	}
                          else
                          	{
	                          if  ( opts.ExternalManage && (rn == td_data_rows_start -1 ) && (cn < td_data_cols_start-1) ) //row headers
	                              {
	                              val= opts.printKeyHeader(c,opts.data_headers[opts.rows[c]]);
	                              }
	                          else if (opts.ExternalManage &&  (rn < td_data_rows_start -1 ) && (cn == 1) ) //col headers
	                              {
	                              val= opts.printKeyHeader(rn,opts.data_headers[opts.cols[rn]]);
	                              }
	                          else
	                            {
	                            if (td_rows_map[r][0]== null) 
	                                val = opts.printTotalRowKey(c,table_data[rn][cn][0]); 
	                            else if (td_cols_map[c][0]== null) 
	                                val = opts.printTotalColKey(c,table_data[rn][cn][0]);
	                            else                       
	                            		val = opts.printKey(c,table_data[rn][cn][0]);
	                          	}
                          	}
                          }
                        //}
										 param = val[1];val = val[0];
                     param += table_data[rn][cn][1] != null ? table_data[rn][cn][1] : ''
                     tr[col_index++] = '<td '+param+'>'+val+'</td>';
                     }
                 td_print[r]='<tr>'+tr.join(' ')+'</tr>';
                 }
           var str='';
           if (!opts.ExternalManage)
              {//create agregate and filter
               str += '<table><tr><td>Aggregate</td><td>Filter</td></tr>'
               str += '<tr><td id="'+opts.agregate_keys_placeholder+'"'+opts.styles.FliterPlaceholder+'></td>';
               str += '<td id="'+opts.filter_keys_placeholder+'" '+opts.styles.FliterPlaceholder+'></td></tr></table></div>';
              }
               str += '<table  class="pv_table">'+td_print.join(' ')+'</table>';
           if ($("#jpivot_placeholder",$this).length == 0) 
           		$($this).empty().append('<div id="jpivot_placeholder"></div>');   
        	 $("#jpivot_placeholder",$this).empty().append(str); 


           opts.OnCreateManage($this);

           jpv_restoreHeaderData($this);         

            
}

;jQuery.fn.jPivot.defaults=
        {
        data:null
        ,rows:null
        ,cols:null
        ,filter:[]
        ,agregate:[]
        ,data_col:null
        ,data_headers:null
        ,immediate_draw:true
        ,TableTitle:'JQuery pivot'
        ,ExternalManage:false
        ,row_keys_placeholder:'pv_row_keys_placeholder'
        ,col_keys_placeholder:'pv_col_keys_placeholder'
        ,agregate_keys_placeholder:'pv_agregate_placeholder'
        ,filter_keys_placeholder:'pv_filter_placeholder'
        ,styles:
            {
             Table:'class="pv_Table"' 
            ,TopLeft:'class="pv_Key"'
            ,TotalColValue:'class="pv_TotalColValue"'
            ,TotalRowValue: 'class="pv_TotalRowValue"'
            ,TotalIntersect:'class="pv_TotalIntersect"'
            ,TotalRowKey:'class="pv_TotalRowKey"'
            ,TotalColKey:'class="pv_TotalColKey"'
            ,Key:'class="pv_Key"'
            ,KeyHeader:'class="pv_KeyHeader"'
            ,Value:'class="pv_Value"'
            ,KeysRowsPlaceholder:'pv_KeysRowsPlaceholder'
            ,KeysColsPlaceholder:'pv_KeysColsPlaceholder'
            ,AgregatePlaceholder:'pv_AgregatePlaceholder'
            ,FliterPlaceholder:'pv_FliterPlaceholder'
            ,class_add_KeyHeaderFiltered:'pv_KeyHeaderFiltered'
            }

//      .pv_TotalIntersect {background-color:#C0C0C0;}
//		  .pv_TotalColValue,.pv_TotalRowValue {background-color:silver;}
//		  .pv_TotalColKey {background-color:green;}
//		  .pv_TotalRowKey {background-color:maroon;}
//      .pv_TotalIntersect {background-color:#C0C0C0;}
//		  .pv_TotalColValue,.pv_TotalRowValue {background-color:silver;}
//		  .pv_TotalColKey {background-color:green;}
//		  .pv_TotalRowKey {background-color:maroon;}
//			.pv_dialog {font-size:10px;}
//			table.pv_Table{border-collapse:collapse;border:1px solid red;}
//			.pv_Table td{border:1px solid green; vertical-align:top;}
//			.pv_key_header_filtered {color:green;}
//			.pv_keys_placeholder {padding:0px;list-style-type: none; margin:0;}
//			#pv_filter li, #pv_row_keys_list li {float:left;}	
//			#pv_row_keys_list{padding-bottom:5px;}
//			#pv_col_keys_list{padding-bottom:0px;}
//			#pv_filter {padding-bottom:5px;}	
			,pivot_data:[]
			,getSort:function(data_row_length)	
					{
					var a=[]; 
					for(i=0;i < data_row_length; i++ )
			    		a[i] = $('#radio_order :radio:checked','#pv_dlg_plh'+i).val() == 'D' ? 1 : -1;		
			    return a;						
					}
			,getTotasMask:function(data_row_length)
					{
					var a=[];
					for(i=0;i < data_row_length; i++ )
			        a[i] = $('input[name=total]:checkbox', '#pv_dlg_plh'+i).attr('checked') ?  1 : 0;
			    return a;						
					}
			,getCustomFilter:function(pvdata_row)//actas INCLUDE filter with 1 value
					{
					//false - pass row, true - do not pass row
			    return false;					
					}						
			,getHeadFilter:function(data_row_length)//actas INCLUDE filter with 1 value
					{
					var a=[];
			 		for(i=0;i < data_row_length; i++ ) 
			 				a[i]=null; 
			    $('#pv_filter li').each( function(){
			              a[$(this).attr('value')]=$('select',this).val()
			              });			
			    return a;					
					}	
			,getDialogFilter:function(data_row_length)//actas EXCLUDE filter with multiple values
					{ 
					var a=jpv_create_2Darray(data_row_length);
					for(i=0;i < data_row_length; i++ ) 
			       $('#filter :checkbox:not(:checked)','#pv_dlg_plh'+i).each(function(){a[i].push($(this).val())})		
					return a;						
					}											
      ,OnDrawData:function($this)
          {
          jpv_pivotDrawData($this);
          }  
      ,OnCreateManage:function($this)
          {
          jpv_OnCreateManage($this)
          }
      ,printTopLeft:function()       
          {
          return [this.TableTitle,this.styles.TopLeft];
          }
			,printTotalColValue:function(data_indexes)
		      {
		      var rclass = this.styles.TotalColValue
    			if (typeof data_indexes == 'undefined') return  ['',rclass];		;
    			var ret=0;
					if (debug==1) ret='tcv'
					if (debug==2) ret='tcv'+data_indexes.join(' +');
						if (!debug)
    					{
    					var len =data_indexes.length 
    					var vals=0;
    					for (i=0;i < len; i++) 
    					    {
    					    vals = data_indexes[i];
    					    if (typeof vals === 'undefined') continue;
    					    for (var j =0 ; j < vals.length; j++)
    							ret += parseFloat(this.data[vals[j]][data_col]);	
    						  }
    					if (!ret) ret='';
    				  }
    		  
    		  return  [ret,rclass];	
		      }
      
			,printTotalRowValue:function(data_indexes)
					{
		      var rclass = this.styles.TotalRowValue
    			if (typeof data_indexes == 'undefined') return  ['',rclass];		;
    			var ret=0;
					if (debug==1) ret='trv'
					if (debug==2) ret='trv'+data_indexes.join(' +');
					if (!debug)
    					{
    					var len =data_indexes.length 
    					var vals=0;
    					for (i=0;i < len; i++) 
    					    {
    					    vals = data_indexes[i];
    					    if (typeof vals === 'undefined') continue;
    					    for (var j =0 ; j < vals.length; j++)
    							ret += parseFloat(this.data[vals[j]][data_col]);	
    						  }
        		  if (!ret) ret='';
    				  }
    		  return  [ret,rclass];					  
					}
			,printTotalIntersect:function()
			    {
					return ['&nbsp;',this.styles.TotalIntersect]
			    }			
		,printValue:function(data_indexes)
					{
		      var rclass = this.styles.Value
    			if (typeof data_indexes == 'undefined') return  ['',rclass];		;
    			var ret=0;
					if (debug==1) ret='trv'
					if (debug==2) ret='trv'+data_indexes.join(' +');
					if (!debug)
    					{
    					var len =data_indexes.length 
    					for (i=0;i < len; i++) 
    							ret += parseFloat(this.data[data_indexes[i]][data_col]);	
    				  }
    		  return  [ret,rclass];	
					}
			,printTotalRowKey:function(data_col,val)
					{
					var rclass = this.styles.TotalRowKey;
    			if (typeof val == 'undefined') return  ['',rclass];		;
				  if (debug==1) return ['TRK',rclass ];
				  if (debug==2) return ['TRK'+data_col+val,rclass ];
					return [val,rclass ];
					}						
			,printTotalColKey:function(data_col,val)
					{
					var rclass = this.styles.TotalColKey;
    			if (typeof val == 'undefined') return  ['',rclass];		;
				  if (debug==1) return ['TCK',rclass ];
				  if (debug==2) return ['TCK'+data_col+val,rclass ];
					return [val,rclass ];
					}						
			,printKey:function(data_col,val)
					{
					var rclass = this.styles.Key;
    			if (typeof val == 'undefined') return  ['',rclass];		;
				  if (debug==1) return ['K',rclass ];
				  if (debug==2) return ['K'+data_col+val,rclass ];
					return [val,rclass ];
					}	
        ,printKeyHeader:function(data_col,val)
					{
					var rclass = this.styles.KeyHeader;
    			if (typeof val == 'undefined') return  ['',rclass];		;
				  if (debug==1) return ['H',rclass ];
				  if (debug==2) return ['H'+data_col+val,rclass ];
					return [val,rclass];
					}	
				,getDataForExcel:function()
						{
						return '';
						}

        }    
      
// Public Variables and Methods
/*
// Public Variables and Methods
$.namespace = {
        options: {},
        publicVariable: [];
        publicMethod: function() {}
};
*/



//Initialization Code 
$(function() { }); 
})(jQuery);            
