(function($) { 
// Private Variables and Functions
var  jpv_keys_placeholder_update_list_cnt=0; 
var debug=0;
//debug functions
function emsgd(obj)
		{
		if ($.browser.mozilla) 
			{
			if (!debug) return;
			if (typeof obj == 'object')				console.dir(obj);
			else console.info(obj);
			console.trace()
			}
		}
function jpv_initialSort(a,b,$this)
		{
		 //Compare "a" and "b" in some fashion, and return -1, 0, or 1
		 //Less than 0: Sort "a" to be a lower index than "b"
		 //Zero: "a" and "b" should be considered equal, and no sorting performed.
		 //Greater than 0: Sort "b" to be a lower index than "a".
		 // rows keep idexes of row keys 
		 // cols keep idexes of col keys 
		 //compare by rows order then cols order
		 rows=$this.opts.rows;
		 cols=$this.opts.cols;
		 order=$this.pv.dialog_sort;
		 
		 for (i=0;i < rows.length;i++)
		 		{
		 		if (a[rows[i]] < b[rows[i]] ) return  1*order[rows[i]]; 
		 		if (a[rows[i]] > b[rows[i]] ) return -1*order[rows[i]]; 
		 		}
			 		
		 for (i=0;i < cols.length;i++)
		 		{
		 		if (a[cols[i]] < b[cols[i]] ) return  1*order[cols[i]]; 
		 		if (a[cols[i]] > b[cols[i]] ) return -1*order[cols[i]]; 
		 		}			 
		 return 0;
		}

function in_array(element, array, addIfAbsent) 
		{
	  for (var i = 0; i < array.length; i++) 
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
		for (i=0;i<len;i++) a.push([]);
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
					)	;		
			$('li','#pv_filter').each(
					function () 
						{ 
						filter.push($(this).attr('value')) 
						}
					)	;							
			jpv_keys_placeholder_update_list_cnt=0;
			$this.opts.cols=cols;
			$this.opts.rows=rows;
			$this.opts.filter=filter;
			jQuery.fn.jPivot.preparePv($this);
			jpv_pivotDrawData($this);
			}

		}	
function jpv_keys_placeholder_popup($this)
		{
				var keys_index=$this.pv.keys_index;
				var keys_index_length=$this.pv.keys_index.length;
				var tstr='';
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
								tstr ='<li id="pv_dlg_plh'+k+'" value="'+k+'"class="ui-state-highlight"> <select> ';
								for (j=0;j < unique_keys_length; j++)
										{
											tstr +='<option>'+unique_keys[j]+'</option>';
										}
								tstr +='</select></li>';
								$('#pv_filter',$this).append(tstr);
									//set current
									$('#pv_dlg_plh'+k+' select',$this).val( ($this.pv.head_filter[k]==null) ? 0 : $this.pv.head_filter[k] )
									//bind click event
									$('#pv_dlg_plh'+k+' select',$this).bind
												(
												"change"
												,function(e) 
														{
																		jQuery.fn.jPivot.preparePv($this);
																		jpv_pivotDrawData($this);
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
													tstr +=unique_keys[i]+'<input type="checkbox" checked name="pv_dlg_plh'+k+'_flt[]" value="'+unique_keys[i]+'"><br>'
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
										icon = 
										table_data_html.push(
											'<li id="pv_key_header'+opts.cols[i]+'" value="'+opts.cols[i]+'"class="ui-state-highlight">'
											+'<span style="float:right;" class="ui-icon '+(pv.dialog_sort[opts.cols[i]] > 0  ? 'ui-icon-triangle-1-s ' : 'ui-icon-triangle-1-n' )+' "></span>'
											+opts.data_headers[opts.cols[i]] 
											+'</li>');
										}
									table_data_html.push('</ul></th>');
									}
								table_data_html.push('<th  class="ui-state-default" colspan="'+pv.keys_colspan[r][c][1]+'">'+pv.keys_colspan[r][c][0]+'</th>');
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
				var ind_r=[]; for (r=0; r < keys_rowspan_length;r++) {ind_r.push([0,0]);}
				for (r=0;r< pv.data_rows_count;r++)
			  		{
			  		table_data_html.push("<tr>\n"); 
			  		for (c=0;c< pv.data_row_length;c++)
			  			{
			  					if ((c==0) && (keys_rowspan_length==0)) table_data_html.push('<td></td><td></td>'); //we have placeholder only, reserve area below it
			  					if  (c < keys_rowspan_length)  
			  						{//header
			  						if (ind_r[c][0] == r)
			  							{
			  							table_data_html.push('<th  rowspan = "'+pv.keys_rowspan[c][ind_r[c][1]][1]+'" class="ui-state-default">'+pv.keys_rowspan[c][ind_r[c][1]][0]+'</th>');
			  							ind_r[c][0] += pv.keys_rowspan[c][ind_r[c][1]][1]; //set when next th will be needed by row
			  							ind_r[c][1]++ ; //set for which section we see
			  							}
			  						}
			  					else
			  						{//data
			  						table_data_html.push('<td>'+pv.data[r][c]+'</td>');
			  						}
			  			}
			  		table_data_html.push("</tr>\n");
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
						
				//set height for cols key headerli
				//for (r=0;r < pv.keys_colspan.length;r++)
				//$('#pv_colkeys_placeholder li:eq('+r+')',$this).height($("#pv_tr_h_col"+r).height());
				//set width for rows key header li
				//for (r=0;r < pv.keys_rowspan.length;r++)
				//$('#pv_rowkeys_placeholder li:eq('+r+')',$this).width($("#pv_tr_h_row"+r).width());
				
				//create popup filters
				jpv_keys_placeholder_popup($this);
				//jpv_keys_placeholder_popup($this,'pv_colkeys_placeholder',pv.cols_keys);
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
				
				return this;                    
    });    	

		}
;jQuery.fn.jPivotDraw =		function($this)
		{

		}		
;jQuery.fn.jPivot.preparePv =		function($this)
		{
        // Persistent Context Variables 
				emsgd('preparePv');      
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

    		//sort by rows-cols headers
    		data_ptr.sort(function(a,b){return jpv_initialSort(a,b,$this);});
    				
				
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
  			
 				//create filters
				for(i=0;i < data_row_length; i++ )
 						$('#pv_dlg_plh'+i+' :checkbox:not(:checked)').each(function(){pv.dialog_filter[i].push($(this).val())})
				for(i=0;i < data_row_length; i++ )
 						pv.head_filter[i] = $('#pv_dlg_plh'+i+' select').length > 0 ? $('#pv_dlg_plh'+i+' select').val() : null ;
		
				var composite_row_key='';var composite_col_key=''
				for (dr=0; dr < data_length ; dr++)
						{
						composite_row_key='';composite_col_key='';is_filtered=false;
						for (dc=0; dc < data_row_length; dc ++)
								{
								if (pv.keys_index[dc]==null) continue; //no row or col
								key=data_ptr[dr][dc];
								in_array(key,pv.unique_keys[dc],true); //add to uniq keys for using in filters
								if ( (pv.head_filter[dc]!=null) &&  (pv.head_filter[dc]!= key) ) {is_filtered=true;continue;}  //key not allowed (filtered) by head filter
								if ( in_array(key,pv.dialog_filter[dc],false) !==null ) {is_filtered=true;continue;} //key filtered in dialog
								if (pv.keys_index[dc]==1) //is row
										composite_row_key += '~~~~'+key;
								else if (pv.keys_index[dc]==2)//is col
										composite_col_key += '~~~~'+key
								
								}
						if (!is_filtered)
								{   //create mapping data to pvtable
								data_row2pv_row[dr]=in_array(composite_row_key,rows_composite_index,true);
								data_row2pv_col[dr]=in_array(composite_col_key,cols_composite_index,true);
								}
						}

	 	
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
								pv.data[data_row2pv_row[i]][data_row2pv_col[i]+rows_length] = data_ptr[i][data_col]; //inset data in its place in row
								if (data_ptr[i][data_col] != null ) for (c=0;c<cols_length;c++)  data_header[c][data_row2pv_col[i] + rows_length] = data_ptr[i][cols_ptr[c]];
  		  		}
  		 
				//rows kyes span
				pv.keys_rowspan=jpv_create_2Darray(rows_length);  
				for (r=0;r < pv.data_rows_count;r++)	
						for (i=0; i < rows_length; i++) 
								jpv_count_keys_span(pv.keys_rowspan[i],pv.data[r][i])
				//cols keys span
				pv.keys_colspan=jpv_create_2Darray(cols_length);
				for (r=0; r < cols_length; r++)
						for (c=rows_length; c < pv.data_row_length; c++)								
								jpv_count_keys_span(pv.keys_colspan[r],data_header[r][c]);
				//th_row_cnt.push(key,cnt)			
		}

;$.fn.jPivot.defaults=
		{
		data:null
		,rows:null
		,cols:null
		,filter:[]
		,data_col:null
		,data_headers:null
		}	


//Initialization Code 
$(function() { }); 
})(jQuery);			
