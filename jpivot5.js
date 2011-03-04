/*
08.05.2010 17:39:58	data moved from	options	(so	its	not	copied)
			-	calls	pivot	as $('#pv').jPivot(data_local,{options....});
			change data	as $('#pv').jPivot(data_local);
			******todo - make	changing data	by $('#pv').jPivot('setGridParam',{})
08.05.2010 17:43:04	 some	optimazings for //create	mapping	data to	pvtable	routine
08.05.2010 23:11:29	 some	variables	scope	checkings
08.05.2010 23:11:48	 r and c attributes	for	td use real	table	coords for collapsings
09.05.2010 14:31:18	 added TD	id as	jpivot_rc_'+r+'_'+cn for fast	collpasing
11.07.2010 0:23:20   added totals_mask usage on first pvtable and dialogs creatings
11.07.2010 0:24:17   used jQuery tableHover plugin (MODIFIED & FIXED!!!) for collapsing rows and cols, old r,c, and TD	id as	jpivot_rc_'+r+'_'+cn for fast	collpasing removed
11.07.2010 0:30:26   added RSP and CSP value for process cols and rows spans (used for adding special class in a6.html onPrintColKey  for collapsings)
*/


/* TODO	-	function.call(this)

* - create td attributes in objectt style as {colspan:,rowspan:id etc}

* - create callback function on print TD - pass coordinates of pv.data ab tabla and attributes

*  - use technics bellow (refactor code)
					1.	//default value:
								var rowSpan = c.rowSpan || 1; 
					2.	//check for array is created:
							if ( !matrix[i] )   
					  	{ 
							   matrix[i] = []; 
						  }
				  3.  //more readable code, use shortcuts for subarrays (arrays passed be reference)
				  		var matrixrow = matrix[k];
							for ( var l = firstAvailCol; l < firstAvailCol + colSpan; l++ )
									{
									matrixrow[l] = 1;
									}
				  4. //create dummy funcs - dont want to test for on==true all the time:
				  				if ( on ) 
										{
											$.fn.tableHoverHover = $.fn.addClass;
										}
										else
										{
											$.fn.tableHoverHover = $.fn.removeClass;
										}
					5. h = colIndex[cell.realIndex] || []
* - integrate jQuery tableHover plugin http://p.sohei.org									
* - integrate jQuery tableHover plugin http://p.sohei.org		for collapsings...							
						
*/

;
( function	( $ )
  {
// Private Variables and Functions
  var	 jpv_keys_placeholder_update_list_cnt = 0;
  function jpv_rowsSort2 ( a, b, $this )
    {
    //Compare	"a"	and	"b"	in some	fashion, and return	-1,	0, or	1
    //Less than	0: Sort	"a"	to be	a	lower	index	than "b"
    //Zero:	"a"	and	"b"	should be	considered equal,	and	no sorting performed.
    //Greater	than 0:	Sort "b" to	be a lower index than	"a".
    // rows	keep idexes	of row keys
    // cols	keep idexes	of col keys
    //compare	by rows	order	then cols	order
    var	rows = $this.opts.rows;
    var	order = $this.pv.dialog_sort;
    var	len	=	rows.length;
    
    for	( i = 0;	i	<	len; i++ )
        {
        if ( a[rows[i]] < b[rows[i]]	)
          return	1*order[rows[i]];
          
        if ( a[rows[i]] > b[rows[i]]	)
          return -1*order[rows[i]];
        }
        
    return 0;
    }
    
  function jpv_rowsSort	( a, b, $this )
    {
    var	rowsa = a.split	( '~~~' );
    var	rowsb = b.split	( '~~~' );
    var	len	=	 rowsa.length;
    var	i;
    var	order = $this.pv.dialog_sort;
    var	rows = $this.opts.rows;
    
    for	( i = 0;	i < len;	i++ )
        {
        if ( rowsa[i] < rowsb[i]	)
          return	1*order[rows[i]];
          
        if ( rowsa[i] > rowsb[i]	)
          return -1*order[rows[i]];
        }
        
    return 0;
    }
    
  function jpv_colsSort	( a, b, $this )
    {
    var	colsa = a.split	( '~~~' );
    var	colsb = b.split	( '~~~' );
    var	len	=	 colsa.length;
    var	i;
    var	order = $this.pv.dialog_sort;
    var	cols = $this.opts.cols;
    
    for	( i = 0;	i < len;	i++ )
        {
        if ( colsa[i] < colsb[i]	)
          return	1*order[cols[i]];
          
        if ( colsa[i] > colsb[i]	)
          return -1*order[cols[i]];
        }
        
    return 0;
    }
    
  function in_array	( element,	array, addIfAbsent )
    {
    len	= array.length;
    
    for	( var i = 0;	i	<	len; i++ )
        {
        if ( element	== array[i] )
          return i;
        }
        
    if ( addIfAbsent )
        {
        array.push ( element );
        return ( array.length - 1 );
        }
        
    return null;
    }
    
  function jpv_create_2Darray	( len )
    {
    var	a = [];
    
    for	( var i = 0;	i < len; i++ )
      a[i] = [];
      
    return a;
    }
    
  function jpv_onCreateManage	( $this )
    {
    var	$this	=	this;
    var	opts = this.opts;
    var	pv = this.pv;
    var	i;
    var	t;
    var	col_drag = pv.col_keys_length	?	'' : 'style="padding-bottom:10px;"'; //fix for empty colheader
    col_drag = '<ul	' + opts.styles.KeysColsPlaceholder + '	' + col_drag + ' id="pv_col_keys_list">';
    
    for	( i = 0;	i < pv.col_keys_length;	i++ )
      col_drag += '<li	id="pv_key_header' + opts.cols[i] + '" value="' + opts.cols[i] + '"	class="ui-state-highlight">'
          + '<span	style="float:right;" class="ui-icon	' + ( pv.dialog_sort[opts.cols[i]] > 0	?	'ui-icon-triangle-1-s	'	:	'ui-icon-triangle-1-n' ) + '	"></span>'
          + opts.data_headers[opts.cols[i]]
          + '</li>';
          
    col_drag += '</ul>';
    
    //row	dragables
    var	row_drag = '<ul	id="pv_row_keys_list">';
    
    for	( i = 0;	i < pv.row_keys_length	;	i++ )
      row_drag += '<li	id="pv_key_header' + opts.rows[i] + '" value="' + opts.rows[i] + '"	class="ui-state-highlight">'
          + '<span	style="float:right;" class="ui-icon	' + ( pv.dialog_sort[opts.rows[i]] > 0	?	'ui-icon-triangle-1-s	'	:	'ui-icon-triangle-1-n' ) + '	"></span>'
          + opts.data_headers[opts.rows[i]]
          + '</li>';
          
    row_drag += '</ul>';
    
    var	aggregate_drag = '<ul	id="pv_aggregate">';
    
    for	( k = 0;	k < opts.aggregate.length; k++ )
      aggregate_drag += '<li	 value="' + opts.aggregate[k] + '" class="ui-state-default">' + opts.data_headers[opts.aggregate[k]] + '</li>	';
      
    aggregate_drag +=	'</ul>';
    
    var	filter_drag	=	'<ul id="pv_filter">';
    
    for	( k = 0;	k < opts.filter.length;	k++ )
        {
        t = opts.filter[k];
        filter_drag	+= '<li value="' + t + '">'
            filter_drag	+= opts.data_headers[t] + '<select>';
            
        for	( i = 0;	i	<	pv.unique_keys[t].length;	i++ )
          if ( pv.unique_keys[t][i] ==	pv.head_filter[t] )
            filter_drag	+= '<option	selected value="' + pv.unique_keys[t][i] + '">' + pv.unique_keys[t][i] + '</option>';
          else
            filter_drag	+= '<option	value="' + pv.unique_keys[t][i] + '">' + pv.unique_keys[t][i] + '</option>';
            
        filter_drag	+= '</select></li>';
        }
        
    filter_drag	+= '</ul>';
    
    $( '#' + opts.filter_keys_placeholder )
    .empty()
    .append	( filter_drag )
    .addClass	( opts.styles.FliterPlaceholder );
    
    if ( $this.opts.immediate_draw )
      $( '#' + opts.filter_keys_placeholder + ' select' ).bind (
        "change"
        , function	( e )
        {
        jpv_preparePv	( $this );
        $this.opts.onDrawData.call ( $this );
        }
        
    );
    
    $( '#' + opts.aggregate_keys_placeholder ).empty().append	( aggregate_drag ).addClass	( opts.styles.aggregatePlaceholder );
    $( '#' + opts.col_keys_placeholder ).empty().append	( col_drag ).addClass	( opts.styles.KeysColsPlaceholder );
    $( '#' + opts.row_keys_placeholder ).empty().append	( row_drag ).addClass	( opts.styles.KeysRowsPlaceholder );
    $( '#pv_row_keys_list,	#pv_col_keys_list, #pv_aggregate,	#pv_filter' )
    .addClass	( 'pv_connectWith' )
    .sortable	(
      {
      connectWith: '.pv_connectWith'
      , forcePlaceholderSize: true
      , forceHelperSize:	true
      , helper: 'clone'
      , opacity:	'0.6'
      , placeholder:	'ui-state-default'
      , tolerance:	'pointer'
      //,cursorAt:	'top,left' //1.8 ui	fix
      , cursor: 'default'
      , snap: true
      , deactivate: function	( event,	ui )
        {
        jpv_keys_placeholder_update	( $this, event,	ui )
        }
      } ).disableSelection();
    //create popup filters
    jpv_keys_placeholder_popup ( $this );
    }
    
  function jpv_keys_placeholder_update ( $this, event,	ui )
    {
    //this func	called for each	lists	(we	have 4)	so wait	until	last
    if ( jpv_keys_placeholder_update_list_cnt++ > 2 )
        {
        var	rows = [];
        var	cols = [];
        var	filter = [];
        var	aggregate = [];
        $( 'li', '#pv_col_keys_list' ).each (
          function ()
          {
          cols.push	( $( this ).attr	( 'value' )	)
          }
          
        );
        $( 'li', '#pv_row_keys_list' ).each (
          function ()
          {
          rows.push	( $( this ).attr	( 'value' )	)
          }
          
        )		 ;
        $( 'li', '#pv_filter' ).each	(
          function ()
          {
          filter.push	( $( this ).attr	( 'value' )	)
          }
          
        )		 ;
        $( 'li', '#pv_aggregate' ).each (
          function ()
          {
          aggregate.push ( $( this ).attr ( 'value' ) )
          }
          
        )		 ;
        jpv_keys_placeholder_update_list_cnt = 0;
        $this.opts.cols = cols;
        $this.opts.rows = rows;
        $this.opts.filter = filter;
        $this.opts.aggregate = aggregate;
        $this.opts.totals_mask = $this.opts.getTotalsMask	( $this.opts.data[0].length );
        
        if ( $this.opts.immediate_draw )
            {
            jpv_preparePv	( $this );
            $this.opts.onDrawData.call ( $this );
            }
        }
    }
    
  function jpv_keys_placeholder_popup	( $this )
    {
    var	opts = $this.opts;
    var	pv = $this.pv;
    //var	keys_index=$this.pv.keys_index;
    //var	keys_index_length=$this.pv.keys_index.length;
    var	keys_index_length	=	pv.unique_keys.length
        var	data_headers = opts.data_headers;
    var	tstr = '';
    var	t1;
    var	t2;
    
    for	( k = 0;	k < keys_index_length; k++ )
        {
        var	unique_keys = pv.unique_keys[k];
        var	unique_keys_length = pv.unique_keys[k].length;
        
        if ( ( unique_keys	== null ) ||	 ( unique_keys_length ==	0 ) )
            {
            $( '#pv_dlg_plh' + k ).remove(); //remove	placeholder
            continue;
            }
            
        //is the dialog	for	col	and	row	headers
        if ( pv.dialog_filter[k].length > 0 )	//we have	filtered keys	-	show this
          $( '#pv_key_header' + k ).addClass ( opts.styles.class_add_KeyHeaderFiltered );
          
        if ( $( '#pv_dlg_plh' + k ).length	== 0 )	//if dialog	not	created
            {
            //we have	no dialog,create
            tstr = '<div id="pv_dlg_plh' + k + '"	style="display:none">';
            tstr += '<div id="radio_order">asc<input	type="radio" checked name="radio_order' + k + '"	value="A"/>'
            tstr += 'dsc<input	type="radio" name="radio_order' + k + '"	 value="D"></div>'
            tstr += '<div>total<input type="checkbox" name="total"	 value="1" '+(opts.totals_mask[k] ==1 ? 'checked' : '')+' ></div>';
            tstr +=	'<div	id="filter">';
            
            for	( i = 0;	i	<	unique_keys_length;	i++ )
              tstr += '<input type="checkbox" checked value="' + opts.onPrintDialogKey	( k, unique_keys[i] ) [0] + '">' + opts.onPrintDialogKey	( k, unique_keys[i] ) [0] + '<br>'
                  tstr += '</div></div>';
                  
            $( $this ).append	( tstr );
            
            $( '#pv_dlg_plh' + k ).dialog
            (
              {
              autoOpen: false
              , title: opts.data_headers[k]
              , dialogClass: 'pv_dialog'
              , buttons:
                {
                Ok:	function()
                  {
                  if ( $this.opts.immediate_draw )
                      {
                      //jpv_build_filters($this);
                      jpv_preparePv	( $this );
                      $this.opts.nDrawData ( $this );
                      }
                      
                  $( this ).dialog ( 'close' );
                  }
                  
                , Cancel: function()
                  {
                  $( this ).dialog ( 'close' );
                  }
                }
              } );
            }
            
        //bind click event,	we must	rebind for each	time in	case header	was	restored from	aggregate	or filter	state
        $( '#pv_key_header' + k ).bind
        (
          "click"
          ,	{selector: '#pv_dlg_plh' + k}
          , function	( e )
          {
          $( e.data.selector )
          .dialog	( 'option', 'position', [e.pageX,e.pageY] )
          .dialog	( "open" )
          }
          
        );
        }
        
    //set	values if	we have	dialog_filter
    //see	getDialogFilter	-	here we	set	filters	an nullify its
    if ( ( typeof ( opts.dialog_filter )	 === 'object' ) &&	( opts.dialog_filter	!= null ) )
        {
        var	filter_len = opts.dialog_filter.length;
        
        for	( var i = 0;	i	<	filter_len;	i++	)
            {
            var	chks = $( '#filter	input:checkbox', '#pv_dlg_plh' + i );
            //try	to check/uncheck keys	in dialogs if	exists
            
            if ( chks.length )
                {
                chks.attr	( 'checked', true );
                
                for	( var j = 0;	j	<	opts.dialog_filter[i].length;	j++ )
                  chks.filter	( '[value=' + opts.dialog_filter[i][j] + ']' ).attr	( 'checked', false );
                }
            }
            
        opts.dialog_filter = null; //clear not needed
        }
    }
    
  function jpv_restoreHeaderData ( $this )
    {
    //restore	keys fields	in pv.data after jpv_nullifyHeaderData
    var	pv = $this.pv;
    var	old;
    
    for	( var c = 0;	c < pv.row_keys_length;	c++ )
        {
        old = null;
        
        for	( var r = pv.col_keys_length; r < pv.data_rows_count; r++ )
            {
            if ( pv.data[r][c]	!= null )
              old = pv.data[r][c];
              
            pv.data[r][c]	=	old;
            }
        }
        
    for	( var r = 0;	r < pv.col_keys_length;	r++ )
        {
        old = null;
        
        for	( var c = pv.row_keys_length; c < pv.data_row_length; c++ )
            {
            if ( pv.data[r][c]	!= null )
              old = pv.data[r][c];
              
            pv.data[r][c]	=	old;
            }
        }
    }
    
  function jpv_nullifyHeaderData ( $this )
    {
    //nullify	repeated keys	fields in	pv.data	for	spans	an totals
    var	pv = $this.pv;
    var	old;
    
    for	( c = 0;	c < pv.row_keys_length - 1;	c++ )
        {
        old = pv.data[pv.col_keys_length][c];
        
        for	( r = pv.col_keys_length + 1; r < pv.data_rows_count; r++ )
          if ( ( old	!= pv.data[r][c] )	|| ( c > 0 ) &&	( pv.data[r][c-1] != null )	)
            old	=	pv.data[r][c];
          else
            pv.data[r][c] = null;
        }
        
    for	( r = 0;	r < pv.col_keys_length;	r++ )
        {
        old = pv.data[r][pv.row_keys_length];
        
        for	( c = pv.row_keys_length + 1; c < pv.data_row_length; c++ )
            {
            if ( ( old	!= pv.data[r][c] )	|| ( r > 0 ) &&	( pv.data[r-1][c] != null )	)
              old	=	pv.data[r][c];
            else
              pv.data[r][c] = null;
            }
        }
    }
    
  function jpv_build_filters ( $this )
    {
    var	drl	=	$this.opts.data[0].length	;
    $this.opts.totals_mask = $this.opts.getTotalsMask	( drl ) || $this.opts.totals_mask;
    $this.pv.head_filter = $this.opts.getHeadFilter	( drl );//=jpv_create_2Darray(data_row_length);	//hold head	filter values	for	each key
    $this.pv.dialog_filter = $this.opts.getDialogFilter	( $this, drl ); //hold	dialog filter	values for each	key
    $this.pv.dialog_sort = $this.opts.getSort	( drl ); //sort	direction	for	each data	index
    }
    
  function jpv_preparePv()
    {
    // Persistent	Context	Variables
    var	$this	 = this;
    var	pv = this.pv;
    var	opts	=	this.opts;
    var	data_length = opts.data.length;
    var	data_row_length = opts.data[0].length;
    var	data_ptr = opts.data;
    var	rows_ptr = opts.rows;
    var	row_keys_length = opts.rows.length;
    var	cols_ptr = opts.cols;
    var	col_keys_length	=	opts.cols.length;
    var	filter_ptr = opts.filter;
    var	filter_length	=	opts.filter.length;
    //for	resoring state (not	data)	we need	serialize
    // rows_ptr,cols_ptr,filter_ptr, aggregate(not holded	in Jpivot)
    // head_filter,dialog_filter,dialog_sort
    jpv_build_filters	( $this )
    
    if ( opts.onBeforePrepare )
        {
        opts.onBeforePrepare();
        }
        
    //////////////// datt	processing /////////////////
    //sort
    //data_ptr.sort(function(a,b){return jpv_rowsSort(a,b,$this);});
    var	pre_uniquie_keys = jpv_create_2Darray	( data_row_length ); //hold	hash of	keys to	improve	performance
    
    pv.unique_keys = jpv_create_2Darray	( data_row_length ); //hold	unique key values	for	each key for dialog	filter
    
    var	rows_composite_index = []; //row key value unique	composite	indexes
    
    var	cols_composite_index = []; //col kye value unique	composite	indexes
    
    var	data_row2pv_row = [];	 //map raw data	rows to	pivot	rows
    
    var	data_row2pv_col = [];	 //map raw data	cols to	pivot	cols
    
    /*
    HOW	IT WORKS
    	 example data
    			data_rows
    				 ['rk1','rk2','cc1','cc2',v0]	is row0
    				 ['rk1','rk2','cc1','cc3',v1]	is row1
    				 ['rk1','rk3','cc1','cc2',v2]	is row2
    	suppose	we want	draw table here	rk-s in	its	rows and cc-s	in its cols, v-s is	value, so	rk-s is	ROWS_keys, cc-s	is COLS_keys
    	create pivot_table which will	hold	prearranged	data
    				find map "data_row to	pivot_row" by	its	rows_kews	,we	will hold	this map in	 data_row2pv_row
    				for	each data_row	create composite_index by	concatenate	rows_keys	with ~~~
    					(
    					row0 and row1	 have	equal	row_composite_index	('rk1~~~rk2')	and	so both	mapped to	pivot_row	0	in pivot_table
    					row2 have	 row_composite_index ('rk1~~~rk3') and	so	mapped to	pivot_row	1	in pivot_table
    					)
    				by columns composite index we	determine	position of	data_row value (v-s) in	pivot_row,
    				we will	hold this	map	in data_row2pv_col
    					(
    					row0 has col_composite_index = 'cc1~~~cc2'	and	mapped to	column	0	of pivot_row 0 (by	data_row2pv_row)
    					row1 has col_composite_index = 'cc1~~~cc3'	and	mapped to	column	1	of pivot_row 0 (by	data_row2pv_row)
    					row2 has col_composite_index = 'cc1~~~cc2' (same as	row0)	so mapped	to column	0	of pivot_row 1 (by	data_row2pv_row)
    					rows indexes obtained	above	in row_composite_index creation
    					)
    	after	this we	will had this	pivot_table
    						|	cc1	|	cc1	|
    						|	cc2	|	cc3	|
    	rk1	|	rk2	|	 v0	|	 v2	|
    	rk1	|	rk3	|	 v2	|			|
    	as seen	in table we	have gap (no data) for rk1-rk3-cc1-cc3 keys.
    	For	those	gaps we	can't	sort data_rows "at once" and must	separate sort	col_composite_index	and	create remapping of	data_row2pv_col
    */
    //console.profile('mainLoop');
    var	composite_row_key_uniq = [];
    
    var	composite_row_key_uniq_len = 0;
    
    var	composite_col_key_uniq = [];
    
    var	composite_col_key_uniq_len = 0;
    
    var	composite_row_key, composite_col_key, dc, dr;
    
    pv.grand_cols_totals = [];
    
    pv.grand_rows_totals = [];
    
    for	( dr = 0; dr	<	data_length	;	dr++ )
        {
        var	is_filtered = false;
        //head filter	unique keys
        
        if ( ( opts.onCustomFilter ) &&	( opts.onCustomFilter ( dr )	)	)
          continue;
          
        for	( i = 0;	i < filter_length; i++ )
            {
            //when we	first	add	key	to head_fiter	(just	drag it	into hoder)	we dont	have values	of this	filter (they are creting here)
            // so	<select> is	not	drawed yet (pv.head_filter[dc]==null)	and	we need	take first value and use it	as filter
            dc = filter_ptr[i];
            key = data_ptr[dr][dc];
            
            if ( pv.head_filter[dc] == null )
              pv.head_filter[dc] = key;
              
            pre_uniquie_keys[dc][key] = key;//add	to uniq	keys for using in	filters
            
            if ( pv.head_filter[dc] != key )
                {
                is_filtered = true;		//key	not	allowed	(filtered) by	head filter	,	continue this	loop to	add	all	possible values	to filter
                }
            }
            
        if ( is_filtered )
          continue;	//do not	continue at	loop above to	add	all	possible values	to dialog_filter
          
        composite_row_key	= '';
        
        for	( i = 0;	i < row_keys_length; i++ )
            {
            dc = rows_ptr[i];
            key = data_ptr[dr][dc];
            pre_uniquie_keys[dc][key] = key;//add	to uniq	keys for using in	filters
            
            if ( is_filtered	|| ( in_array	( key, pv.dialog_filter[dc], false ) != null	)	)
                {
                is_filtered = true;		//key	not	allowed	(filtered)	in dialog, continue	to add all possible	values to	filter
                continue;
                }
                
            composite_row_key	+= key + '~~~';
            }
            
        composite_col_key	=	'';
        
        for	( i = 0;	i < col_keys_length; i++ )
            {
            dc = cols_ptr[i];
            key = data_ptr[dr][dc];
            pre_uniquie_keys[dc][key] = key;	//add	to uniq	keys for using in	filters
            
            if ( is_filtered	||	( in_array	( key, pv.dialog_filter[dc], false ) != null	)	)
                {
                is_filtered = true;		//key	not	allowed	(filtered)	in dialog
                continue;
                }
                
            //composite_col_key[idx++]=key;
            composite_col_key	+= key + '~~~';
            }
            
        if ( !is_filtered )
            {
            //create mapping data	to pvtable
            if ( typeof composite_row_key_uniq[composite_row_key] === 'undefined' )
                {
                composite_row_key_uniq[composite_row_key]	=	data_row2pv_row[dr] = composite_row_key_uniq_len++;
                }
            else
                {
                data_row2pv_row[dr] = composite_row_key_uniq[composite_row_key];
                }
                
            if ( typeof composite_col_key_uniq[composite_col_key] === 'undefined' )
                {
                data_row2pv_col[dr] = composite_col_key_uniq[composite_col_key]	=	composite_col_key_uniq_len++;
                }
            else
                {
                data_row2pv_col[dr] = composite_col_key_uniq[composite_col_key];
                }
                
            /* new variant is	more complex - use old
            //create grand totals
            gt_r=data_row2pv_col[dr]+row_keys_length;
            gt_c=data_row2pv_row[dr]+col_keys_length;
            if (typeof	pv.grand_rows_totals[gt_r] === 'undefined' )
            		{
            		pv.grand_rows_totals[gt_r]=[];
            		}
            if (typeof	pv.grand_rows_totals[gt_r][data_row2pv_row[dr]]	===	'undefined'	)
            		{
            			 pv.grand_rows_totals[gt_r][data_row2pv_row[dr]]=[];
            		}
            pv.grand_rows_totals[data_row2pv_col[dr]+row_keys_length][data_row2pv_row[dr]].push(dr);
            if (typeof	pv.grand_cols_totals[gt_c] === 'undefined' )
            		{
            		pv.grand_cols_totals[gt_c]=[];
            		}
            if (typeof	pv.grand_cols_totals[gt_c][data_row2pv_col[dr]]	===	'undefined'	)
            		{
            			 pv.grand_cols_totals[gt_c][data_row2pv_col[dr]] =[];
            		}
            pv.grand_cols_totals[gt_c][data_row2pv_col[dr]]	.push([dr]);
            */
            }
        }
        
    //create standart	array	from hash;
    for	( var j	in composite_row_key_uniq )
      rows_composite_index.push	( j );
      
    for	( var j	in composite_col_key_uniq )
      cols_composite_index.push	( j );
      
    //sort cols	and	create remapping
    var	cols_composite_index_remap = [];
    
    cols_composite_sorted = [];
    
    len = cols_composite_index.length;
    
    //copy array
    //for	(i=0;	i	<	len	;	i++)
    //	cols_composite_sorted[i] = cols_composite_index[i];
    var	cols_composite_sorted	=	cols_composite_index.slice();
    
    cols_composite_sorted.sort ( function ( a, b )
      {
      return jpv_colsSort	( a, b, $this );
      } );
      
    //find index of	cols_composite_index[i]in	cols_composite_sorted	and	map	its	index
    
    for	( i = 0;	i	<	len	;	i++ )
      cols_composite_index_remap[i] = in_array ( cols_composite_index[i], cols_composite_sorted, false );
      
    //sort rows	and	create remapping
    var	rows_composite_index_remap = [];
    
    rows_composite_sorted = [];
    
    len = rows_composite_index.length;
    
    //copy array
    //for	(i=0;	i	<	len	;	i++)
    //	rows_composite_sorted[i] = rows_composite_index[i];
    var	 rows_composite_sorted = rows_composite_index.slice();
    
    rows_composite_sorted.sort ( function ( a, b )
      {
      return jpv_rowsSort	( a, b, $this );
      } );
      
    //find index of	cols_composite_index[i]in	cols_composite_sorted	and	map	its	index
    
    for	( i = 0;	i	<	len	;	i++ )
      rows_composite_index_remap[i] = in_array ( rows_composite_index[i], rows_composite_sorted, false );
      
    //sort unique	keys for filters
    for	( var i = 0,	len = pre_uniquie_keys.length;	i	<	len; i++ )
        {
        for	( var j	in pre_uniquie_keys[i] )
            {
            pv.unique_keys[i].push ( j );
            }
            
        pv.unique_keys[i].sort();
        }
        
    pv.col_keys_length = col_keys_length;
    
    pv.row_keys_length = row_keys_length;
    pv.data_rows_count = rows_composite_index.length + col_keys_length;	//rows count+col headers rows
    pv.data_row_length = cols_composite_index.length + row_keys_length;
    pv.data = [];
    pv.data = jpv_create_2Darray ( pv.data_rows_count );
    //init pv_data
    var	rn;
    var	cn;
    
    for	( i = 0;	i < data_length; i++ )
        {
        rn = rows_composite_index_remap[data_row2pv_row[i]] + col_keys_length; //data	row	mapped to	 pv.data[rn] row
        
        if ( ( rn == null )	|| ( data_row2pv_col[i] == null )	)
          continue;	//row	filtered,	so it	not	mapped
          
        for	( j = 0;	j < row_keys_length; j++ )
          pv.data[rn][j] = data_ptr[i][rows_ptr[j]]; //fill	row	keys
          
        //store	data_ptr index instead of	actual value
        //this will	be needed	on totals	and	data display functions
        cn = cols_composite_index_remap[data_row2pv_col[i]] + row_keys_length; //data	row	mapped to	 pv.data[rn][cn] col
        
        if ( typeof pv.data[rn][cn] ==	'undefined' )
          pv.data[rn][cn] = [];	//init value
          
        pv.data[rn][cn].push ( i );	//add	data row index to	value
        
        /* TODO	some overworking in	cols_keys	fill */
        if ( data_ptr[i][data_col]	!= null	)	//fill cols	keys
          for	( c = 0;	c < col_keys_length; c++ )
            pv.data[c][cn] = data_ptr[i][cols_ptr[c]];
        }
        
    for	( c = 0;	c < col_keys_length; c++ )
      for	( var r = 0;	r	<	row_keys_length; r++ )
        pv.data[c][r] = null;
        
    //console.dir(pv.data);
    //create rows	totals and spans
    // contaln array wih values	of pv.data cel
    //save pv.data cells to	totals
    //save with	undefined
    // links and count of	 cells wiil	be needed	by statistics	functions	(	MIN	for	exmple)
    jpv_nullifyHeaderData	( $this )
    var	cur_key;
    
    //format of	totals = [key][key_pos][data_array]
    //where	key	=0;key < row_keys_length-1		-	is a number	of row_key - 0 - is	most left	in table
    //keypos - cur number	of total row (one	for	each distinct	key	value)
    //format of	data_rows_totals_pos - hold	postiton of	pv.data	cll	in totals_row
    // pv.data_rows_totals_pos[rw][i][key] =	key_pos
    pv.rows_totals = jpv_create_2Darray	( row_keys_length );
    
    pv.data_rows_totals_pos = [];
    
    for	( r = col_keys_length;	r	<	pv.data_rows_count;	r++ )
        {
        pv.data_rows_totals_pos[r] = [];
        
        for	( var i = row_keys_length;	i	<	pv.data_row_length;	i++ )
            {
            pv.data_rows_totals_pos[r][i] = [];
            }
        }
        
    function fill_cnt	( rw )
    
      {
      for	( var i = row_keys_length;	i	<	pv.data_row_length;	i++ )
          {
          pv.rows_totals[c][cur_key][i].push( pv.data[rw][i] );
          pv.data_rows_totals_pos[rw][i][c] = cur_key;
          }
      }
      
    if ( row_keys_length	>	1 )
        {
        for	( c = 0;	c < row_keys_length - 1; c++ )
            {
            cur_key = 0;
            pv.rows_totals[c][cur_key] = jpv_create_2Darray	( pv.data_row_length );//hold	ptr	to array with	totals
            pv.rows_totals[c][cur_key] [c] = pv.data[col_keys_length][c];
            fill_cnt ( col_keys_length )
            
            for	( r = col_keys_length + 1;	r	<	pv.data_rows_count;	r++ )
                {
                if ( pv.data[r][c] !=	null )
                    {
                    pv.rows_totals[c][++cur_key] = jpv_create_2Darray ( pv.data_row_length );
                    pv.rows_totals[c][cur_key] [c] = pv.data[r][c];
                    }
                    
                fill_cnt ( r );
                }
            }
        }
        
    pv.cols_totals = jpv_create_2Darray	( col_keys_length );
    
    pv.data_cols_totals_pos = [];
    
    for	( var i = col_keys_length;	i	<	pv.data_rows_count;	i++ )
        {
        pv.data_cols_totals_pos[i] = []
        
            for	( c = row_keys_length;	c	<	pv.data_row_length;	c++ )
            {
            pv.data_cols_totals_pos[i][c] = []
                }
            }
            
        function fill_cnt_col	( col )
        
      {
      for	( var i = col_keys_length;	i	<	pv.data_rows_count;	i++ )
          {
          pv.cols_totals[r][cur_key][i][pv.cols_totals[r][cur_key][i].length + 1] = pv.data[i][col];
          pv.data_cols_totals_pos[i][col][r] = cur_key;
          }
      }
      
    if ( col_keys_length	>	1 )
        {
        for	( r = 0;	r < col_keys_length - 1; r++ )
            {
            cur_key = 0;
            pv.cols_totals[r][cur_key] =	jpv_create_2Darray ( pv.data_rows_count );//hold ptr to	array	with totals
            pv.cols_totals[r][cur_key][r] = pv.data[r][row_keys_length];
            fill_cnt_col ( row_keys_length )
            
            for	( c = row_keys_length + 1;	c	<	pv.data_row_length;	c++ )
                {
                if ( pv.data[r][c] !=	null )
                    {
                    pv.cols_totals[r][++cur_key] = jpv_create_2Darray	( pv.data_rows_count )
                        pv.cols_totals[r][cur_key] [r] = pv.data[r][c];
                    }
                    
                fill_cnt_col ( c );
                }
            }
        }
        
    //Grand	totals
    pv.grand_cols_totals = jpv_create_2Darray	( pv.data_rows_count );
    
    pv.grand_rows_totals = jpv_create_2Darray	( pv.data_row_length );
    
    for	( c = row_keys_length;	c	<	pv.data_row_length;	c++	 )
      for	( r = col_keys_length;	r	<	pv.data_rows_count;	r++ )
          {
          //if (pv.data[r][c]!=	null)
          pv.grand_cols_totals[r].push ( pv.data[r][c] );
          pv.grand_rows_totals[c].push ( pv.data[r][c] );
          }
          
///	aggregators	setup
    if ( typeof debug === 'undefined' )
        {
        debug = 0;
        }
        
    if ( debug	&& ( debug	!==	3 ) )
        {
        opts.aggregate_value.aggregator = jpv_debug_value;
        opts.aggregate_total_col.aggregator = jpv_debug_total;
        opts.aggregate_total_row.aggregator = jpv_debug_total;
        }
    else
        {
        switch ( opts.aggregate_value.aggregator )
            {
            
            case null: //default
            
            case 'SUM':
              opts.aggregate_value.aggregator = jpv_aggregateSUM_val;
              break;
              
            case 'AVG':
              opts.aggregate_value.aggregator = jpv_aggregateAVG_val;
              break;
              
            case 'PERC':
              opts.aggregate_value.aggregator = jpv_aggregatePERC_val;
              break;
            }
            
        switch ( opts.aggregate_total_col.aggregator )
            {
            
            case null://default
            
            case 'SUM':
              opts.aggregate_total_col.aggregator = jpv_aggregateSUM_total;
              break;
              
            case 'AVG':
              opts.aggregate_total_col.aggregator = jpv_aggregateAVG_total;
              break;
            }
            
        switch ( opts.aggregate_total_row.aggregator )
            {
            
            case null://default
            
            case 'SUM':
              opts.aggregate_total_row.aggregator = jpv_aggregateSUM_total;
              break;
              
            case 'AVG':
              opts.aggregate_total_row.aggregator = jpv_aggregateAVG_total;
              break;
            }
        }
        
    //set	default	precision	for	values calculations
    if	(	( typeof( opts.aggregate_value.precision )	===	'undefined' ) ||	( opts.aggregate_value.precision == null ) )
      opts.aggregate_value.precision = 2;
      
    opts.aggregate_value.precision_k = Math.pow( 10, opts.aggregate_value.precision );
    
    if	(	( typeof( opts.aggregate_total_col.precision )	===	'undefined' ) ||	( opts.aggregate_total_col.precision == null ) )
      opts.aggregate_total_col.precision = 2;
      
    opts.aggregate_total_col.precision_k = Math.pow( 10, opts.aggregate_total_col.precision );
    
    //opts.pivot_data	=	pv;
    if	(	( typeof( opts.aggregate_total_row.precision )	===	'undefined' ) ||	( opts.aggregate_total_row.precision == null ) )
      opts.aggregate_total_row.precision = 2;
      
    opts.aggregate_total_row.precision_k = Math.pow( 10, opts.aggregate_total_row.precision );
    
    //opts.pivot_data	=	pv;
    if ( opts.precalculateTotals )
        {
        jpv_precalculateTotals ( opts );
        }
        
    if ( opts.onAfterPrepare )
        {
        opts.onAfterPrepare();
        }
    }
    
  function jpv_pivotDrawData()
    {
    var $this = this;
    
    if ( $this.opts.onBeforeDraw )
      $this.opts.onBeforeDraw.call(this);
      
    jpv_nullifyHeaderData	( $this );
    
    var	table_data = [];
    
    var	opts = $this.opts;
    
    var	pv = $this.pv;
    
    var	filter_length = opts.filter.length;
    
    var	row_keys_length = pv.row_keys_length;
    
    row_keys_length = ( !row_keys_length )	?	1	:	row_keys_length; //fix when	no row keys, reserve place for key header	placeholder
    
    var	col_keys_length = pv.col_keys_length;
    
    //temp vars
    var	r;
    
    var	c;
    
    //create array for table_data
    var	td_data_rows_start = 1 + col_keys_length;//actual	data start 1(row headers here	and	delimiter) +[col keys	count]
    
    var	td_rows_count = pv.data_rows_count + 1;//+ [number of	rows +1	for	horizontal delimiter];
    
    var	td_data_cols_start = row_keys_length + 1;	//	actual data	start	[rows	keys count]+1(cols headers here)
    
    var	td_cols_count = td_data_cols_start + pv.data_row_length - row_keys_length;// + [number of	cols with	data];
    
    var	pv2td_data_col_diff = -row_keys_length + td_data_cols_start
        var	tdr = 0;
        
    var	tdc = 0;
    
    if ( !col_keys_length )
        {
        table_data[tdr] = [];
        
        for	( c = 0;	c < pv.data_row_length + 1;	c++ )
          table_data[tdr][tdc++] = [null,null];
          
        tdr++; //add fake	header if	no	col	keys
        
        tdc = 0;
        
        table_data[tdr] = [];
        
        for	( c = 0;	c < pv.data_row_length + 1;	c++ )
          table_data[tdr][tdc++] = [null,null];
          
        tdr++; //add horiz delimiter here	(in	loop below condition is	always false)
        
        td_rows_count++;
        
        td_data_rows_start++;
        }
        
    for	( r = 0;	r < pv.data_rows_count;	r++ )
        {
        tdc = 0;
        table_data[tdr] = [];
        
        if ( tdr == col_keys_length	)
            {
            //skip horizontal	delimiter
            for	( c = 0;	c < pv.data_row_length + 1;	c++ )
              table_data[tdr][tdc++] = [null,null];
              
            tdr++;
            
            tdc = 0;
            
            table_data[tdr] = [];
            }
            
        //rows keys
        for	( c = 0;	c < pv.data_row_length;	c++ )
            {
            if ( c == row_keys_length )
              table_data[tdr][tdc++] = [null,null] //skip	vertical delimiter
                  if ( ( c	>= row_keys_length )	&& ( r	>= col_keys_length )	)
                  {
                  //value
                  table_data[tdr][tdc++] =
                    [
                    {
                    cell_value:pv.data[r][c] //cell	values
                    , data_pos:
                      {
                      row: r, col: c
                      }	//pos	in pv.data
                      
                    , totals_pos:
                      {
                      //pos	in rows	totals
                      row: typeof	pv.data_rows_totals_pos[r] !== 'undefined' ? pv.data_rows_totals_pos[r][c] : null
                      , col :	typeof pv.data_cols_totals_pos[r]	!==	'undefined'	?	pv.data_cols_totals_pos[r][c]	:	null
                      }
                    }
                  , null	//td attributes
                    ]
                    }
                else
                  {
                  //key
                  table_data[tdr][tdc++] = [pv.data[r][c], null];
                  }
            }
            
        tdr++;
        }
        
    //ADD	row	totlas
    function append_total_row	( col, key_ind )
      {
      table_data[add] = [];
      
      for	( var c = 0;	c	<	td_data_cols_start;	c++ )
        table_data[add][c] = [null,null];
        
      table_data[add][col] = ['&Sigma;&nbsp;'+pv.rows_totals[col][key_ind][col], 'colspan="' + ( row_keys_length - col ) + '"'];
      
      for	( var c = row_keys_length;	c	<	pv.data_row_length;	c++ )
        table_data[add][c+pv2td_data_col_diff] = [pv.rows_totals[col][key_ind][c], opts.styles.TotalRowValue];
      }
      
    var	total_index = [];
    
    for	( var c = row_keys_length - 1;	c	>= 0;	c-- )
      total_index[c] = 0;
      
    var	total_mask = [];
    
    for	( var r = 0;	r < row_keys_length; r++ )
      total_mask[r] = opts.totals_mask[opts.rows[r]];
      
    var	td_rows_map = [];
    
    for	( var r = 0;	r < td_data_rows_start + 1;	r++ )
      td_rows_map[r] = [r,null]; //map headers and first data	row	-they	not	have totals	before
      
    var	r_index = td_data_rows_start + 1;
    
    var	add = td_rows_count;
    
    for	( var r = td_data_rows_start + 1; r < td_rows_count;	r++ )
        {
        for	( var c = row_keys_length - 1 - 1;	c	>= 0;	c-- )
            {
            //check	if we	had	any	totals for this	col
            if ( ( table_data[r][c][0]	!= null ) &&	 ( total_mask[c] ) )
                {
                //we need	to add total BEFORE	current	data row,	because	we hold	total_index	on previous	keys
                append_total_row ( c, total_index[c]++ )
                td_rows_map[r_index++] = [null,add++];
                }
            }
            
        td_rows_map[r_index++] = [r,null];
        }
        
    //last row is	total; code	bolow	is quicker then	additional checks	in mail	loop;
    for	( var c = row_keys_length - 1 - 1;	c	>= 0;	c-- )
        {
        if ( total_mask[c] )
            {
            append_total_row ( c, total_index[c]++ );
            td_rows_map[r_index++] = [null,add++];
            }
        }
        
    //td_rows_count	=	add++;
    //add	grand	total	row	(totals	by column)
    table_data[add] = [];
    
    for	( var c = 0;	c	<	td_data_cols_start;	c++ )
      table_data[add][c] = [null,null];
      
    table_data[add][0] = ['GT','colspan="'+	( row_keys_length )	+'"'];
    
    for	( var c = row_keys_length;	c	<	pv.data_row_length;	c++ )
      table_data[add][c+pv2td_data_col_diff] = [pv.grand_rows_totals[c], opts.styles.TotalRColValue];
      
    td_rows_map[r_index++] = [null,add++];
    
    td_rows_count	=	add;
    
    //create row spans
    for	( var c = row_keys_length - 1 - 1;	c	>= 0;	c-- )
        {
        var	do_span = 0;
        var	is_tot = 0;
        var	span = 1;
        var	r_index = td_rows_map[td_data_rows_start][0];	//point	to the first row with	data - it	always have	keys.
        
        for	( var r = td_data_rows_start + 1; r < td_rows_count;	r++ )
            {
            var	rn =	td_rows_map[r][0]	!= null	?	td_rows_map[r][0]	:	td_rows_map[r][1];
            //look left	if we	had	header or	total
            
            for	( var j = c;	j	>= 0; j-- )
              if ( table_data[rn][j][0] !=	null )
                  {
                  if ( !is_tot )
                    table_data[r_index][c] = [table_data[r_index][c][0], 'rowspan="' + span + '"'];
                    
                  r_index	=	rn;
                  
                  is_tot =	td_rows_map[r][0]	!= null	?	0	:	1; //do	not	create rowspan for totals
                  
                  span = 0;
                  
                  break;
                  }
                  
            span++
            }
            
        if ( !is_tot )
          table_data[r_index][c] = [table_data[r_index][c][0], 'rowspan="' + span + '"'];
        }
        
    //	Create col mappings	and	append cols	totals
    function append_total_col	( key_ind )
      {
      var	tot_index = col_keys_length;
      var	rn;
      
      for	( var r = 0;	r	<	td_rows_count; r++ )
          {
          rn =	( td_rows_map[r][0] != null ) ? td_rows_map[r][0] : td_rows_map[r][1];
          
          if ( r	<	td_data_rows_start )
              {
              if ( r	== tc )
                table_data[rn][add] = ['&Sigma;&nbsp;'+pv.cols_totals[r][key_ind][r], 'rowspan="' +	( col_keys_length - tc ) + '"'];
              else
                table_data[rn][add] = [null,null]
                    }
              else
              {
              if ( td_rows_map[r][0] == null ) //totals	intrsect
                table_data[rn][add] = [[], null]; //	this is	 total row - add empty
              else
                table_data[rn][add] = [pv.cols_totals[tc][key_ind][tot_index++], ''];
              }
          }
      }
      
    var	td_cols_map = [];//	hold maps	of cols	with data	and	totals cols;
    
    var	key_i_group = [];
    
    for	( var c = 0;	c	<	col_keys_length - 1 - 1; c++ )
      key_i_group[c] = 0 //current totals	index
          for	( c = 0;	c	<	td_data_cols_start;	c++ )
            td_cols_map[c] = [c,null]; //skip	headers	and	first	rows;
            
    var	ind	=	td_data_cols_start;	//hold current map index
    
    var	add	=	td_cols_count; //number	of added rows
    
    var	total_mask = [];
    
    for	( var r = 0;	r < col_keys_length; r++ )
      total_mask[r] = opts.totals_mask[opts.cols[r]];
      
    for	( var c = 0;	c	<	col_keys_length - 1; c++ )
      key_i_group[c] = 0;	//current	totals index
      
    for	( c = td_data_cols_start; c < td_cols_count;	c++ ) //loop	by columns
        {
        for	( var tc = col_keys_length	- 1 - 1;	tc >=	0; tc--	)	//loop by	col	keys ROWS
            {
            if ( ( total_mask[tc] )	&& ( table_data[tc][c][0] !=	null )	)
                {
                if ( c	!= td_data_cols_start )
                    {
                    append_total_col ( key_i_group[tc]++ )
                    td_cols_map[ind++] = [null,add++];
                    }
                }
            }
            
        td_cols_map[ind++] = [c,null];
        }
        
    //lastcol	is last	totals
    for	( var tc = col_keys_length	- 1 - 1;	tc >=	0; tc--	)
      if ( total_mask[tc] )
          {
          append_total_col ( key_i_group[tc]++ )
          td_cols_map[ind++] = [null,add++];
          }
          
    //add	grand	total	col	(totals	by row)
    var	rn;
    
    tc = pv.col_keys_length;
    
    for	( var r = 0;	r	<	td_rows_count; r++ )
        {
        rn =	( td_rows_map[r][0] != null ) ? td_rows_map[r][0] : td_rows_map[r][1];
        
        if ( r	<	td_data_rows_start )
            {
            if ( r	== 0 )
              table_data[rn][add] = ['GT','rowspan="'+ ( col_keys_length ) +'"'	];
            else
              table_data[rn][add] = [null,null]
                  }
            else
            {
            if ( td_rows_map[r][0] == null ) //totals	intrsect
              table_data[rn][add] = [[], null]; //	this is	 total row - add empty
            else
              table_data[rn][add] = [pv.grand_cols_totals[tc++], ''];
            }
        }
        
    td_cols_map[ind++] = [null,add++];
    
    //end	grand	total	col
    td_cols_count	=	ind;
    //create col spans
    var	c_index;
    var	cn;
    
    for	( r = td_data_rows_start - 1 - 1	;	r	>= 0;	r-- ) //skip	delimeter, skip	last colkeys row
        {
        //header rows	mapped 'as is' - whe don't need	use	td_rows_map;
        is_tot = 0;
        span = 1;
        c_index = td_cols_map[td_data_cols_start][0];	//point	to the first col with	data - it	always have	keys.
        
        for	( c = td_data_cols_start + 1; c < td_cols_count;	c++ )
            {
            cn =	td_cols_map[c][0]	!= null	?	td_cols_map[c][0]	:	td_cols_map[c][1];
            
            for	( var j = r;	j	>= 0; j-- )	//look top if	we had header	or total
              if ( table_data[j][cn][0] !=	null )
                  {
                  if ( !is_tot )
                    table_data[r][c_index] = [table_data[r][c_index][0], 'colspan="' + span + '"'];
                    
                  c_index	=	cn;
                  
                  is_tot =	td_cols_map[c][0]	!= null	?	0	:	1; //do	not	create rowspan for totals
                  
                  span = 0;
                  
                  break;
                  }
                  
            span++
            }
            
        if ( !is_tot )
          table_data[r][c_index] = [table_data[r][c_index][0], 'colspan="' + span + '"']; //las col
        }
        
    //Actual print
    var	 ck	=	col_keys_length	?	col_keys_length	:	1;
    
    table_data[0][0] = [opts.TableTitle,'colspan="'+row_keys_length+'" rowspan="'+ck+'"'];
    
    //Cols adn rows	headers	fill
    if ( opts.ExternalManage )
        {
        if ( col_keys_length == 0 )
            {
            table_data[0][2] = ['Val',null];
            table_data[0][1] = ['',null];
            }
            
        for	( i = 0;	i	<	col_keys_length; i++ )
          table_data[i][1] = [opts.data_headers[opts.cols[i]], null];
          
        for	( i = 0;	i	<	row_keys_length; i++ )
          table_data[ck][i]	=	[opts.data_headers[opts.rows[i]], null];
          
        table_data[ck][i++] = ['RSP',' rowspan="'+ ( td_rows_count-col_keys_length ) +'"'];
        
        table_data[ck][i++] = ['CSP',' colspan="'+ ( td_cols_count-row_keys_length-1 ) +'"'];
        }
    else
        {
        table_data[0][1] = ['CKP','	rowspan="'+ck+'" id="'+opts.col_keys_placeholder+'"	style="min-width:40px;"'];
        table_data[ck][0] = ['RKP',' id="'+opts.row_keys_placeholder+'"	colspan="'+row_keys_length+'"'];
        table_data[ck][1] = ['RSP','class="pv_Key_rs" rowspan="'+ ( td_rows_count-col_keys_length ) +'"'];
        table_data[ck][2] = ['CSP','class="pv_Key_cs" colspan="'+ ( td_cols_count-row_keys_length ) +'"'];
        
        if ( col_keys_length == 0 )
          table_data[0][2] = ['55',null];
        }
        
    var	td_print = [];
    
    var	row_total_index = [];
    
    for	( var i = 0 ; i <= pv.row_keys_length;i++ )
      row_total_index[i] = 0;
      
    var	col_total_index = [];
    
    for	( var i = 0 ; i <= pv.col_keys_length;i++ )
      col_total_index[i] = 0;
      
    for	( var r = 0;	r	<	td_rows_count; r++ )
        {
        var	tr = [];
        var	col_index = 0;
        
        for	( var c = 0;	c	<	td_cols_count	 ; c++ )
            {
            var	rn =	( td_rows_map[r][0] != null ) ? td_rows_map[r][0] : td_rows_map[r][1];
            var	cn =	( td_cols_map[c][0] != null ) ? td_cols_map[c][0] : td_cols_map[c][1];
            var	 param = '';
            var	val = '';
            
            if ( ( r	>= td_data_rows_start ) &&	( c >=	td_data_cols_start )	)
                {
                // data
                if ( ( td_rows_map[r][0] !=	null )	&& ( td_cols_map[c][0] !=	null )	)
                    {//values
                    val	=	opts.aggregate_value.aggregator.call( opts, table_data[rn][cn][0] );
                    val	=	opts.aggregate_value.formatter.call( opts, val );
                    }
                else
                    {
                    if ( ( td_rows_map[r][0] ==	null )	&& ( td_cols_map[c][0] ==	null )	)
                        {	//totla	intesect
                        val = opts.onPrintTotalIntersect();
                        }
                    else
                        {
                        if ( td_rows_map[r][0] ==	null )
                            {//TotalRowValue
                            //val	=	opts.onPrintTotalRowValue	(table_data[rn][cn][0]);
                            val	=	opts.aggregate_total_row.aggregator.call( opts, table_data[rn][cn][0], 'R' );
                            val	=	opts.aggregate_total_row.formatter.call( opts, val, 'R' );
                            }
                        else
                            {//TotalColValue
                            val	=	opts.aggregate_total_col.aggregator.call( opts, table_data[rn][cn][0], 'C' );
                            val	=	opts.aggregate_total_col.formatter.call( opts, val, 'C' );
                            }
                        }
                    }
                }
            else
                {
                //keys
                if ( table_data[rn][cn][0]	== null )  continue;	//skip	empty	cell
                  
                if ( ( r == 0 )	&& ( c == 0 )	)
                    {
                    val = opts.onPrintTopLeft();
                    }
                else if	(	opts.ExternalManage	&& ( rn ==	td_data_rows_start - 1	)	&& ( cn < td_data_cols_start - 1 ) ) //row headers
                    {
                    val = opts.onPrintRowKeyHeader	( c, table_data[rn][cn][0] );
                    }
                else if ( opts.ExternalManage	&&	( rn	<	td_data_rows_start - 1	)	&& ( cn ==	1 ) ) //col headers
                    {
                    val = opts.onPrintColKeyHeader	( rn, table_data[rn][cn][0] );
                    }
                else if ( td_rows_map[r][0] ==	null )
                    {
                    val	=	opts.onPrintTotalRowKey	( c, table_data[rn][cn][0] );
                    }
                else if ( td_cols_map[c][0] ==	null )
                    {
                    val	=	opts.onPrintTotalColKey	( r, table_data[rn][cn][0] );
                    }
                else if ( r >=	 td_data_rows_start )
                    {
                    val	=	opts.onPrintRowKey ( c, row_total_index[c]++, table_data[rn][cn][0] );
                    }
                else
                    {
                    val	=	opts.onPrintColKey ( r, col_total_index[r]++, table_data[rn][cn][0] );
                    }
                }
                
            param	=	val[1];
            
            val	=	val[0];
            param	+= table_data[rn][cn][1] !=	null ? table_data[rn][cn][1] : '';//totals params
            tr[col_index]	=	'<td ' + param + '>' + val + '</td>';
            col_index++;
            }
            
        td_print[r] = '<tr>' + tr.join ( '	' ) + '</tr>';
        }
        
    var	str = '';
    
    if ( !opts.ExternalManage )
        {
        //create aggregate and filter
        str	+= '<table><tr><td>Aggregate</td><td>Filter</td></tr>';
        str	+= '<tr><td	id="' + opts.aggregate_keys_placeholder + '"' + opts.styles.FliterPlaceholder + '></td>';
        str	+= '<td	id="' + opts.filter_keys_placeholder + '"	' + opts.styles.FliterPlaceholder + '></td></tr></table></div>';
        }
        
    str	+= '<table	class="pv_table">' + td_print.join ( '	' ) + '</table>';
    
    if ( $( "#jpivot_placeholder", $this ).length	== 0 )
      $( $this ).empty().append	( '<div id="jpivot_placeholder"></div>' );
      
    $( "#jpivot_placeholder", $this ).empty().append	( str );
    
    opts.onCreateManage.call ( $this );
    
    // if	restoring	dialog filter
    //in getDialogFilter - we	set	filters	for	prepare_pv
    //we set filters values	in dialogs in	jpv_keys_placeholder_popup
    // an	nullify	its	 here	again
    opts.dialog_filter = null; //clear not needed
    
    jpv_restoreHeaderData	( $this );
    
    if ( opts.onAfterDraw )
      opts.onAfterDraw.call($this);
    }
    
  //create empty	holder
  $.jpivot = $.jpivot	|| {};
  //extend holder	with extend_method and init	functions
  $.extend( $.jpivot,
    {
    extend : function	( methods )
      {
      $.extend ( $.fn.jPivot, methods );
      }
    }
          );
  $.fn.jPivot = function	(	pin	)
    {
    if ( typeof pin ==	'string' )
        {
        var	fn = $.fn.jPivot[pin];
        
        if ( !fn )
            {
            throw	( "jpivot - No	such method: " + pin );
            }
            
        var	args = $.makeArray ( arguments ).slice ( 1 );
        
        return fn.apply	( this, args );
        }
        
    //we called	for	init
    var	data = arguments[0];
    
    var	options	=	arguments[1];
    
    return this.each
        (	function()
      {
      if ( this.pv )
          {
          this.opts.data = data;
          return;
          }
          
      //init;
      this.opts	=	{};
      
      this.opts		=	$.extend ( true,
        {
        //options
        //data:null
        rows: null
        , cols: null
        , filter: []
        , aggregate: []
        , data_col: null
        , data_headers: null
        , totals_mask: []
        , immediate_draw: true
        , TableTitle: 'JQuery	pivot'
        , ExternalManage: false
        , row_keys_placeholder: 'pv_row_keys_placeholder'
        , col_keys_placeholder: 'pv_col_keys_placeholder'
        , aggregate_keys_placeholder: 'pv_aggregate_placeholder'
        , filter_keys_placeholder: 'pv_filter_placeholder'
        , styles:
          {
          Table: 'class="pv_Table"'
          , TopLeft: 'class="pv_Key"'
          , TotalColValue: 'class="pv_TotalColValue"'
          , TotalRowValue:	'class="pv_TotalRowValue"'
          , TotalIntersect: 'class="pv_TotalIntersect"'
          , TotalRowKey: 'class="pv_TotalRowKey"'
          , TotalColKey: 'class="pv_TotalColKey"'
          , Key: 'class="pv_Key"'
          , KeyHeader: 'class="pv_KeyHeader"'
          , Value: 'class="pv_Value"'
          , KeysRowsPlaceholder: 'pv_KeysRowsPlaceholder'
          , KeysColsPlaceholder: 'pv_KeysColsPlaceholder'
          , aggregatePlaceholder: 'pv_aggregatePlaceholder'
          , FliterPlaceholder: 'pv_FliterPlaceholder'
          , class_add_KeyHeaderFiltered: 'pv_KeyHeaderFiltered'
          }
          
        , pivot_data: []
        //events
        , onBeforePrepare: null
        , onAfterPrepare: null
        , onBeforeDraw: null
        , onAfterDraw: null
        , getSort: function	( data_row_length )
          {
          var	a = [];
          
          for	( i = 0;	i	<	data_row_length; i++ )
            a[i] = $( '#radio_order :radio:checked', '#pv_dlg_plh' + i ).val()	== 'D' ? 1 : -1;
            
          return a;
          }
          
        , getTotalsMask: function	( data_row_length )
          {
          var	a = [];
          var exists=false;
          for	( i = 0;	i	<	data_row_length; i++ )
          	{
          	exists = exists || $( 'input[name=total]:checkbox', '#pv_dlg_plh' + i ).length; 
            a[i] = $( 'input[name=total]:checkbox', '#pv_dlg_plh' + i ).is ( ':checked' ) ;
          	}
          if (!exists) return false;
          return a;
          }
          
        , onCustomFilter: null
        /*
        		,onCustomFilter:function(pvdata_row)//act	as INCLUDE filter	with 1 value
        				{
        				//false	-	pass row,	true - do	not	pass row
        				return false;
        				}
        		*/
        , getHeadFilter: function	( data_row_length )	//actas	INCLUDE	filter with	1	value
          {
          var	a = [];
          
          for	( i = 0;	i	<	data_row_length; i++ )
            a[i] = null;
            
          $( '#pv_filter	li' ).each	(	function()
            {
            a[$( this ).attr ( 'value' ) ] = $( 'select', this ).val()
                } );
                
          return a;
          }
          
        , getDialogFilter: function	( $this, data_row_length )	//ac tas EXCLUDE filter	with multiple	values
          {
          var	a = jpv_create_2Darray ( data_row_length );
          
          if ( ( typeof ( $this.opts.dialog_filter )	 === 'object' ) &&	( $this.opts.dialog_filter	!= null ) )
              {
              /*									//try	to restore filters
              we don't have	dialogs	before 1-st	prepare.
              we can resore	filters	on another dataset so	keys will	not	be equals	to filter	values;
              so do	this once, check length, and clear restore data
              and	on next	prepare	we recreate	filter as	needed
              */
              $.extend ( a, $this.opts.dialog_filter ); //copy	to a so	length will	not	be less	than data_row_length
              return a;
              }
              
          for	( var i = 0;	i	<	data_row_length; i++ )
            $( '#filter input:checkbox', '#pv_dlg_plh' + i ).not	( ':checked' ).each	( function()
              {
              a[i].push	( $( this ).val() )
              } )
              
          return a;
          }
          
        , onDrawData: function()
          {
          jpv_pivotDrawData.call ( this );
          }
          
        , onCreateManage: function()
          {
          jpv_onCreateManage.call	( this )
          }
          
        , onPrintTopLeft: function()
          {
          return [this.TableTitle,this.styles.TopLeft];
          }
          
        , onPrintTotalIntersect: function()
          {
          return ['&nbsp;',this.styles.TotalIntersect];
          }
          
        /*
        								,onPrintTotalColValue:function (data_indexes)
        										{
        										return jpv_print_total.call	(this,data_indexes,this.styles.TotalColValue,'tcv');
        										}
        */
        , onPrintTotalRowKey: function ( data_col, val )
          {
          return jpv_print_key.call	( this, data_col, val, this.styles.TotalRowKey, 'TRK' );
          }
          
        , onPrintTotalColKey: function ( data_col, val )
          {
          return jpv_print_key.call	( this, data_col, val, this.styles.TotalColKey, 'TCK' );
          }
          
        , onPrintDialogKey: function ( data_col, val )
          {
          return jpv_print_key.call	( this, data_col, val, this.styles.Key, 'K' );
          }
          
        , onPrintRowKey: function	( key_inex, total_index, val )
          {
          if (val=='RSP' || val=='CSP') 
          	return jpv_print_key.call	( this, key_inex, val, '', 'K' );
          else 
          	return jpv_print_key.call	( this, key_inex, val, this.styles.Key, 'K' );
          }
          
        , onPrintColKey: function	( key_inex, total_index, val )
          {
          if (val=='RSP' || val=='CSP') 
          		return jpv_print_key.call	( this, key_inex, val, '', 'K' );
          else 
          	 return jpv_print_key.call	( this, key_inex, val, this.styles.Key, 'K' );
          }
          
        , onPrintRowKeyHeader: function	( data_col, val )
          {
          return jpv_print_key.call	( this, data_col, val + 'RK', this.styles.KeyHeader, 'H' );
          }
          
        , onPrintColKeyHeader: function	( data_col, val )
          {
          return jpv_print_key.call	( this, data_col, val + 'CK', this.styles.KeyHeader, 'H' );
          }
          
        , aggregate_value:
          {
          aggregator: 'SUM'
          , precision: 2
          , data_col_cnt: null //col pos in	dataset	fo avg counts
          , formatter: jpv_format_value	//function for format	values jpv_format_value(value) retutns [value,attribute]
          }
          
        , aggregate_total_col:
          {
          aggregator: 'SUM'
          , precision: 2
          , data_col_cnt: null //col pos in	dataset	fo avg counts
          , formatter: jpv_format_total	//function for format	values jpv_format_value(value) retutns [value,attribute]
          }
          
        , aggregate_total_row:
          {
          aggregator: 'SUM'
          , precision: 2
          , data_col_cnt: null //col pos in	dataset	fo avg counts
          , formatter: jpv_format_total	//function for format	values jpv_format_value(value) retutns [value,attribute]
          }
          
        , precalculateTotals: false
//public methods

        }//end standart
      ,	$.jpivot.defaults,	options	|| {} );
      
      this.opts.data = data;
      //this.opts	=	opts;
      this.pv = {}; //context pivot data
      this.opts.pivot_data = this.pv ;// ptr to	context	pivot	data
      jpv_preparePv.call ( this )
      
      if ( this.opts.immediate_draw )
        this.opts.onDrawData.call	( this );
        
      return this;
      }
      
        );
    }
    
  function jpv_print_key ( data_col, val, rclass, dbg_prefix )
    {
    if ( typeof val ==	'undefined' )
      return	['',rclass];
      
    if ( typeof debug === 'undefined' )
      debug = 0;
      
    if ( debug == 1 )
      return [dbg_prefix,rclass	];
      
    if ( debug == 2 )
      return [dbg_prefix+data_col+val,rclass ];
    return [val,rclass];
    }
    
// values	aggregate
  function jpv_debug_value( data_indexes )
    {
    var	ret;
    
    if ( typeof data_indexes.cell_value ==	'undefined' )
        {
        ret	=	'undef';
        }
        
    if ( debug == 1 )
        {
        ret	= 'v';
        }
        
    if ( debug == 2 )
        {
        ret	=	'vals['	+	data_indexes.cell_value.join ( ',' ) + ']';
        ret	+= ' data_pos[' + data_indexes.data_pos.row + ',' + data_indexes.data_pos.col + ']';
        ret	+= ' tot_pos[' + data_indexes.totals_pos.row.join	( ',' )	+ '],[' + data_indexes.totals_pos.col.join	( ',' )	+ ']';
        }
        
    return ret;
    }
    
  function jpv_aggregatePERC_val ( data_indexes )
    {
    // pv.data_rows_totals_pos[rw][i][key] =	key_pos
    var	tot	=	0;
    
    if ( typeof data_indexes	===	'undefined' )
        {
        return null;
        }
        
    var	pv = this.pivot_data;
    
    var	agp	=	this.aggregate_value;
    var	cell_aggregator = null;	//set	cell agregation	same as	for	total
    
    if ( ( agp.totalBy == 'R' )	&&	( typeof	( data_indexes.totals_pos.row[agp.key] ) !== 'undefined' ) )
        {
        cell_aggregator	=	this.aggregate_total_row.aggregator;
        tot = pv.rows_totals[agp.key][data_indexes.totals_pos.row[agp.key]][data_indexes.data_pos.col];
        }
        
    if ( ( agp.totalBy == 'C' )	&&	( typeof	( data_indexes.totals_pos.col[agp.key] ) !== 'undefined' ) )
        {
        cell_aggregator	=	this.aggregate_total_col.aggregator;
        tot = pv.cols_totals[agp.key][data_indexes.totals_pos.col[agp.key]][data_indexes.data_pos.row];
        }
        
    if ( ( agp.totalBy == 'GC' ) )
        {
        cell_aggregator	=	this.aggregate_total_col.aggregator;
        tot = pv.grand_cols_totals[data_indexes.data_pos.row];
        }
        
    if ( ( agp.totalBy == 'GR' ) )
        {
        cell_aggregator	=	this.aggregate_total_row.aggregator;
        tot = pv.grand_rows_totals[data_indexes.data_pos.col];
        }
        
    if ( typeof ( tot ) ===	'object' )
        {
        tot = cell_aggregator.call ( this, tot, agp.totalBy );
        }
        
    cell_val = cell_aggregator.call( this, [data_indexes.cell_value], agp.totalBy );
    
    var	ret	=	 tot ?	 cell_val / tot	 : null;
    
    if ( debug == 3 )
      return ret + '%=' + cell_val + '/' + tot;
      
    return ret;
    }
    
  function jpv_aggregateSUM_val	( data_indexes )
    {
    if ( typeof	data_indexes.cell_value	===	'undefined' )
        {
        return null;
        }
        
    var	ret = 0;
    
    var	len	= data_indexes.cell_value.length
    
        for	( i = 0;	i	<	len; i++ )
          ret	+= parseFloat	( this.data[data_indexes.cell_value[i]][data_col] );
          
    return ret;
    }
    
  function jpv_aggregateAVG_val	( data_indexes )
    {
    if ( typeof data_indexes	===	'undefined' )
        {
        return null;
        }
        
    var	ret = 0;
    
    var	len	= data_indexes.cell_value.length;
    var	cnt = 0;
    //simple or	with precalc avg method
    
    if ( ( typeof( this.aggregate_value.data_col_cnt )	!==	'undefined' ) &&	 ( this.aggregate_value.data_col_cnt	!= null ) )
        {
        //with precalc avg method
        for	( var i = 0;	i	<	len; i++ )
            {
            ret	+= parseFloat	( this.data[data_indexes.cell_value[i]][data_col] );
            cnt	+= parseFloat	( this.data[data_indexes.cell_value[i]][this.aggregate_value.data_col_cnt] );
            }
        }
    else
        {
        //simple avg
        for	( var i = 0;	i	<	len; i++ )
            {
            ret	+= parseFloat	( this.data[data_indexes.cell_value[i]][data_col] );
            cnt	++;
            }
        }
        
    var	ret_t	=	cnt	?	ret / cnt	:	null;
    
    //var	ret_t	=	cnt	?	Math.round (	this.aggregate_value.precision_k	*	ret/cnt)	/	this.aggregate_value.precision_k	 : 0;
    
    if ( debug == 3 )
      return ret_t + '=' + ret + '/' + cnt;
      
    return ret_t;
    }
    
  function jpv_format_value	( ret )
    {
    var	rclass = this.styles.Value;
    
    if ( ret == null )
        {
        ret = '';
        }
        
    if ( typeof ret === 'number' )
        {
        ret	=	Math.round ( this.aggregate_value.precision_k * ret ) / this.aggregate_value.precision_k	;
        }
        
    return	[ret,rclass];
    }
    
// totals	aggregate
  function jpv_debug_total ( data_indexes, T_type )
    {
    if ( typeof data_indexes	===	'undefined' )
      ret = 'undef';
      
    if ( typeof debug === 'undefined' )
      debug = 0;
      
    if ( debug == 1 )
      ret	=	'';
      
    if ( debug == 2 )
      ret	=	 typeof	( data_indexes ) === 'object'	?	'[' + data_indexes.join	( ' +' ) + ']' : data_indexes;
      
    if ( ret == null )
      ret = T_type + ' null';
      
    return	T_type + ret;
    }
    
  function jpv_precalc_totals_cells	( aggregate_total, arr )
    {
    var	len = arr.length;
    
    for	( var i = 0 ; i < len ; i++ )
      arr[i] = aggregate_total.aggregator.call ( opts, arr[i] );
    }
    
  function jpv_precalculateTotals	( opts )
    {
    var	pv = opts.pivot_data;
    jpv_precalc_totals_cells ( opts, pv.grand_rows_totals );
    jpv_precalc_totals_cells ( opts, pv.grand_cols_totals );
    
    for	( var i = 0 ; i < pv.rows_totals.length ; i++ )
      for	( var j = 0 ; j < pv.rows_totals[i].length	;	j++ )
        jpv_precalc_totals_cells( opts.aggregate_total_row, pv.rows_totals[i][j] );
        
    for	( var i = 0 ; i < pv.cols_totals.length ; i++ )
      for	( var j = 0 ; j < pv.cols_totals[i].length	;	j++ )
        jpv_precalc_totals_cells( opts.aggregate_total_col, pv.cols_totals[i][j] );
    }
    
  function jpv_aggregateSUM_total	( data_indexes_tot, T_type )
    {
    if ( typeof data_indexes_tot	===	'undefined' )
        {
        return null;
        }
        
    if ( typeof ( data_indexes_tot )	!==	'object' )
      return data_indexes_tot; //preaggregated
      
    var	len	= data_indexes_tot.length
        var	vals = 0;
        
    ret = 0;
    
    for	( i = 0;	i	<	len; i++ )
        {
        vals = data_indexes_tot[i];
        
        if ( typeof vals	===	'undefined' )
          continue;
          
        for	( var j = 0	;	j	<	vals.length; j++ )
          ret	+= parseFloat	( this.data[vals[j]][data_col] );
        }
        
    return ret;
    }
    
  function jpv_aggregateAVG_total	( data_indexes_tot, T_type )
    {
    if ( typeof data_indexes_tot	===	'undefined' )
        {
        return null;
        }
        
    if ( typeof ( data_indexes_tot )	!==	'object' )
      return data_indexes_tot; //preaggregated
      
    var	len	= data_indexes_tot.length;
    
    var	vals = 0;
    
    var	ret = 0;
    
    var	cnt = 0;
    
    //simple or	with precalc avg method
    for	( i = 0;	i	<	len; i++ )
        {
        vals = data_indexes_tot[i];
        
        if ( typeof vals	===	'undefined' )
          continue;
          
        //use	one	if (not	check	in loop) for performance
        if ( ( ( ( T_type == 'R' )	|| ( T_type == 'GR' ) )	&& ( this.aggregate_total_row.data_col_cnt	!= null ) )	|| ( ( ( T_type == 'C' )	|| ( T_type == 'GC' ) )	&& ( this.aggregate_total_col.data_col_cnt	!= null ) )	)
            {
            //with precalc avg method
            for	( var j = 0	;	j	<	vals.length; j++ )
                {
                ret	+= parseFloat	( this.data[vals[j]][data_col] );
                cnt	+= parseFloat	( this.data[vals[j]][data_col_cnt] );
                }
            }
        else
            {
            //simple avg
            for	( var j = 0	;	j	<	vals.length; j++ )
                {
                ret	+= parseFloat	( this.data[vals[j]][data_col] );
                cnt++;
                }
            }
        }
        
    //var	pricision=1;
    //if ((T_type=='R')	|| (T_type=='GR')) pricision = this.aggregate_total_row.precision_k;
    //if ((T_type=='C')	|| (T_type=='GC')) pricision = this.aggregate_total_col.precision_k;
    //var	ret_r	=	cnt	?	Math.round ( pricision * ret/cnt ) / pricision	:	0;
    var	ret_r	=	cnt	?	ret / cnt	:	null;
    
    if ( debug == 3 )
      return ret_r + '=' + ret + '/' + cnt;
      
    return ret_r;
    }
    
  function jpv_format_total	( ret, T_type )
    {
    var	rclass = '';
    var	precision = 1;
    
    if ( ( T_type == 'GC' ) || ( T_type == 'C' ) )
        {
        rclass = this.styles.TotalColValue;
        precision = this.aggregate_total_col.precision_k;
        }
        
    if ( ( T_type == 'GR' ) || ( T_type == 'R' ) )
        {
        rclass = this.styles.TotalRowValue;
        precision = this.aggregate_total_row.precision_k;
        }
        
    if ( ret == null )
        {
        ret = '';
        }
        
    if ( typeof ret === 'number' )
        {
        ret	=	Math.round ( precision * ret ) / precision ;
        }
        
    return	[ret,rclass];
    }
    
//extend with	public methods
  $.jpivot.extend
  (
    {
    getGridParam : function	( pName )
      {
      var	$t = this[0];	//get	from first object	only
      
      if ( !$t.opts )
          {
          return;
          }
          
      if ( !pName )
          {
          return $t.opts;
          }
      else
          {
          return typeof	( $t.opts[pName] ) !=	"undefined"	?	$t.opts[pName] : null;
          }
      }
      
    , setGridParam	:	function ( newParams )
      {
      return this.each
          ( function()
        {
        if ( this.opts	&& typeof	( newParams )	===	'object' )
            {
            $.extend ( true, this.opts, newParams );
            }
        } );
      }
      
    , drawData	:	function()
      {
      return this.each
          ( function()
        {
        this.opts.onDrawData.call	( this );
        } );
      }
      
    , prepareData : function()
      {
      return this.each
          ( function()
        {
        jpv_preparePv.call ( this );
        } );
      }
      
    , saveGridParam : function	()
      {
      var	$this	=	this[0]; //get from	first	object only
      
      if ( !$this.opts )
          {
          return;
          }
          
      var	t	=
      
        {
        data_headers : $this.opts.data_headers
        , data_col	:	$this.opts.data_col
        , cols	:	$this.opts.cols
        , rows	:	$this.opts.rows
        , aggregate : $this.opts.aggregate
        , filter	:	$this.opts.filter
        , totals_mask : $this.opts.totals_mask
        //dialog filters not saving	-	on restore they	not	defined	or we	can't	know they	ids
        //t.head_filter	=	pv0.pv.head_filter;
        //t.dialog_sort	=	pv0.pv.dialog_sort;
        , dialog_filter : $this.pv.dialog_filter
        }
      return t;
      }
      
    , restoreGridParam	:	function ( savedParams )
      {
      return this.each
          ( function()
        {
        if ( this.opts	&& typeof	( savedParams )	===	'object' )
            {
            $.extend ( true, this.opts, savedParams );
            }
        } );
      }
      
    , getDataForExcel: function()
      {
      return '';
      }
    } )
//Initialization Code
//$(function() { });
  } ) ( jQuery );