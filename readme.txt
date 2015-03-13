example_data1	
	//keyindexes:    0   1   2   3  4
	data_rows[0][ 	'A','B','C','D',0   ];
	data_rows[1][ 	'C','B','C','D',2   ];
	data_rows[2][ 	'F','B','C','D',2   ];
	data_rows[3][ 	'F','B','C','E',2   ];
suppose tis data represent ....... and data_rows[0][0]='A' is value of citi, data_rows[1][0]='C' of citi, data_rows[1][2]='B' value of district etc....
key_index: cities is at postion 0 and we call it further as key0, district at position 1 and called key2 etc.

key - is all unique value of data_rows at key_index, so cities (key0) has key values ['A','C','F'] and key1 has key values ['B']

'F'@key0 is value 'F' of key0 (aka cities)      


/* ========================================== */
opts.rows : hold indexes of keys used as row keys
   ex: if we want to use key0 and key3 as row keys then
   opts.rows = [0,3];
opts.cols : hold indexes of keys used as cols keys
   ex: if we want to use key1 and key2 as cols keys then
   opts.rows = [1,2];
   
/* ========================================== */
pv.unique_keys : array of all unique values for each key. Its populated during jpv_Prepare;
   after prepare of [example_data1] will contain
   pv.unique_keys[0] = ['A','C','F']
   pv.unique_keys[1] = ['B'];
   pv.unique_keys[2] = ['C'];
   pv.unique_keys[3] = ['D','E'];
   
   used to populate filters etc.
 

/* ========================================== */
	
pv.dialog_filter : hold values of keys to hide (EXCLUDE) rows in pivot
  so filtered rows not included in pivot, but its keys remain visible to dialog filters.
	FOr example have [example_data1] and we want filter(exlude) rows with  'A' or 'C' at fist (0) key position
	then pv.dialog_filter must contain
	
	pv.dialog_filter [0] = ['A','C'] //filter values 'A' and 'C' in key0
	pv.dialog_filter [1] = [] //empy, dont fliter
	pv.dialog_filter [2] = [] //empy, dont fliter
	pv.dialog_filter [3] = []
	
	after jpv_preparePv these rows will NOT be included in pivot data 
	if we set 
		pv.dialog_filter [3] = ['D'];
	then pivot will by empty but all keys will by populated to unique_keys
	and avaible to filter data again
	
/* ========================================== */
opts.filter	: hold key_index for keys used in head_filter
		ex. if we want to inlude only rows with particular values in keys2 AND keys3 then
		 opts.filter = [2,3];
		on first pivot prepare pv.head_filter[2] will by populated by first value of key2('C') and  pv.head_filter[2] = 'D' and only rpws with
		key2='C' AND key3='D' will be added to pivot.
		
/* ========================================== */		
pv.head_filter: hold single  key_value (as populated bu HTML <select>) of key_index to show (INCLUDE)  rows containing key with this one key_value @ key_index
	example: we want to filter all rows with 'E'@key3 AND 'C'@key2;
	
	pv.head_filter [0] = null //empty, pass all key values to pivot
	pv.head_filter [1] = null //empty, pass all key values to pivot
	pv.head_filter [2] = 'C' //pass only 'C'@key2
	pv.head_filter [3] = 'E' //pass only 'E'@key3
	
	all keys populated to pv.unique_keys, even if all rows with those keys not included in pivot


	
/* ========================================== */		
	
 opts.onCustomFilter ( dr ) :  custom function called on each row in data_row to fliter(exclude) rows from pivot
    dr - is data_row[i], must return true to filter(exclude) data_row	from pivet, false othervise
    we have [example_data1] and want to exclude all rows with ('A'@key0 and 'C'@key2) : 
	  opts.onCustomFilter = function(data_row) 
	  			{
	  				if (data_row[0]=='A' and data_row[2]=='C') 
	  					{
	  						return true; 
	  					}
	  				return false;
	  		  }
	   be aware that this filter exclude rows as is (with its keys), so if you filter 'C'@key2 in [example_data1]
	   then you will end up with empty pivot and empty unique_keys; 
	   see pv.dialog_filter for diffirences
	
	
	
	
	
	
	
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



TOD0
  add unique prefix to all DOM-ids generated by jPivot


/* ================================ */
JS array references
a=[ 
 ['a','b','c']
 ,['d','f','g']
 ]
 
 b=a[0];
 b[0]='new';
 
console.info( a) 
    [["new", "b", "c"], ["d", "f", "g"]]
c=[];
c.push(a[1])
c[0][1]='new2'
console.info( a)
    [["new", "b", "c"], ["d", "new2", "g"]]
    
    
    
 