   var data_local =[
   
["Киев","Глобус, ТЦ \"Подземный простор\"","Внешний вид Сотрудника","4.0000","4.0000","100.00","4"],
["Киев","Глобус, ТЦ \"Подземный простор\"","Выявление потребностей, прием заказа","3.0000","5.0000","60.00","5"],
["Киев","Глобус, ТЦ \"Подземный простор\"","Качество блюд","3.5000","4.6000","76.09","19"],
["Киев","Глобус, ТЦ \"Подземный простор\"","Общие комментарии","1.2000","2.0000","60.00","2"],
["Киев","Глобус, ТЦ \"Подземный простор\"","Операционные стандарты ресторана.","5.0000","6.0000","83.33","6"],
["Киев","Глобус, ТЦ \"Подземный простор\"","Поведение Сотрудника","3.0000","3.0000","100.00","3"],
["Киев","Глобус, ТЦ \"Подземный простор\"","Презентация товара и расчет","1.0000","5.0000","20.00","5"],
["Киев","Глобус, ТЦ \"Подземный простор\"","Приветствие, установление контакта","4.0000","6.0000","66.67","6"],
["Киев","ТРЦ ДримТаун","Внешний вид Сотрудника","4.0000","4.0000","100.00","4"],
["Киев","ТРЦ ДримТаун","Выявление потребностей, прием заказа","3.0000","5.0000","60.00","5"],
["Киев","ТРЦ ДримТаун","Качество блюд","4.2000","4.6000","91.30","19"],
["Киев","ТРЦ ДримТаун","Общие комментарии","1.3000","2.0000","65.00","2"],
["Киев","ТРЦ ДримТаун","Операционные стандарты ресторана.","4.0000","6.0000","66.67","6"],
["Киев","ТРЦ ДримТаун","Поведение Сотрудника","3.0000","3.0000","100.00","3"],
["Киев","ТРЦ ДримТаун","Презентация товара и расчет","3.0000","5.0000","60.00","5"],
["Киев","ТРЦ ДримТаун","Приветствие, установление контакта","5.0000","6.0000","83.33","6"],
["Киев","ТРЦ Караван","Внешний вид Сотрудника","3.0000","4.0000","75.00","4"],
["Киев","ТРЦ Караван","Выявление потребностей, прием заказа","1.0000","5.0000","20.00","5"],
["Киев","ТРЦ Караван","Качество блюд","3.3000","4.6000","71.74","19"],
["Киев","ТРЦ Караван","Общие комментарии","1.0000","2.0000","50.00","2"],
["Киев","ТРЦ Караван","Операционные стандарты ресторана.","5.0000","6.0000","83.33","6"],
["Киев","ТРЦ Караван","Поведение Сотрудника","2.0000","3.0000","66.67","3"],
["Киев","ТРЦ Караван","Презентация товара и расчет","2.0000","5.0000","40.00","5"],
["Киев","ТРЦ Караван","Приветствие, установление контакта","3.0000","6.0000","50.00","6"]   ];
   
var rows = [0,2];   
var cols = [1];
var aggregate=[];
/*
      ,sum(pfi.value*(case q.weight when 0 then 0 when null then 0 else q.weight end)) as ball
     ,sum((case q.weight when 0 then 0 when null then 0 else q.weight*q.max_ball end)) as max_ball
     ,case q.weight when 0 then 0 when null then 0 else  
        (case q.max_ball when 0 then 0 when null then 0 else round(sum(pfi.value*q.weight)*100/sum(q.weight*q.max_ball),2)  end)
         end  as percent 
     ,count(*) as cnt 
*/
var data_col=3;   
var data_col_max_ball=4;  
var data_col_percent=5;  
var data_col_cnt=6; 
var filter = [];
var data_headers=["город","объект","блок","рейтинг, %"];
var pivot_pos={"data_headers":["город","объект","блок","рейтинг, %"],"data_col":3,"cols":[1],"rows":[0,2],"agregate":[],"filter":[],"totals_mask":[0,0,0,0,0,0,0]};