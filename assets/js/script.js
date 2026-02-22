
function rearrange_data(data){
    data = sort_by(data, 'state', 'str', 'asc');
    return data;
}
function sort_by(obj, short_by, data_Type, short_type){
    if(short_by == '') return false;
    if(data_Type == 'str'){
        for(i=0,len = Object.getOwnPropertyNames(obj).length - 1; i<len; i++){
            for(j=i+1; j<len; j++){
                if(short_type == 'asc'){
                    if(obj[j][short_by].toLowerCase() < obj[i][short_by].toLowerCase()){
                        x = obj[j];
                        obj[j] = obj[i];
                        obj[i] = x; 
                    }
                }
                else if(short_type == 'desc'){
                    if((obj[j][short_by]).toLowerCase() > obj[i][short_by].toLowerCase()){
                        x = obj[j];
                        obj[j] = obj[i];
                        obj[i] = x; 
                    }
                }
            }
        }
    }
    else{
        for(i=0,len = Object.getOwnPropertyNames(obj).length - 1; i<len; i++){
            for(j=i+1; j<len; j++){
                if(short_type == 'asc'){
                    if(obj[j][short_by] < obj[i][short_by]){
                        x = obj[j];
                        obj[j] = obj[i];
                        obj[i] = x; 
                    }
                }
                else if(short_type == 'desc'){
                    if((obj[j][short_by]) > obj[i][short_by]){
                        x = obj[j];
                        obj[j] = obj[i];
                        obj[i] = x; 
                    }
                }
            }
        }
    }
    return obj; 
}
function get_time_string(t){
    if(t >= 60*60*24*30*12){
        let r = parseInt(t / (60*60*24*30*12));
        return (r > 1)? (r+' Years'):(r+' Year');
    }
    else if(t >= 60*60*24*30){
        let r = parseInt(t / (60*60*24*30));
        return (r > 1)? (r+' Months'):(r+' Month');
    }
    else if(t >= 60*60*24){
        let r = parseInt(t / (60*60*24));
        return (r > 1)? (r+' Days'):(r+' Day');
    }
    else if(t >= 60*60){
        let r = parseInt(t / (60*60));
        return (r > 1)? (r+' Hours'):(r+' Hour');
    }
    else if(t >= 60){
        let r = parseInt(t / 60);
        return (r > 1)? (r+' Mins'):(r+' Min');
    }
    else{
        return t+' Sec';
    }
}
function replace_null_data(data){
    for(i=0,len = Object.getOwnPropertyNames(data).length - 1; i < len; i++){
        for(j in data[i]){
            if(data[i].hasOwnProperty(j)){
                if(data[i][j] == null || data[i][j] === ''){
                    data[i][j] = '--';
                }
            }
        }
    }
    for(j in data["statistics"]){
        if(data["statistics"].hasOwnProperty(j) && data["statistics"][j] == null){
            data["statistics"][j] = '--';
        }
    }
    return data;
}
function insert_wrld_data(){
    $('#st_data_conf').text(world_data.statistics.total_confirmed);
    $('#st_data_conf_inc').text(world_data.statistics.total_confirmed_increase);
    $('#st_data_cure').text(world_data.statistics.total_cured);
    $('#st_data_cure_inc').text(world_data.statistics.total_cured_increase);
    $('#st_data_death').text(world_data.statistics.total_death);
    $('#st_data_death_inc').text(world_data.statistics.total_death_increase);
}
function insert_ind_data(){
    $('#st_data_conf').text(data.statistics.total_confirmed);
    $('#st_data_conf_inc').text(data.statistics.total_confirmed_increase);
    $('#st_data_cure').text(data.statistics.total_cured);
    $('#st_data_cure_inc').text(data.statistics.total_cured_increase);
    $('#st_data_death').text(data.statistics.total_death);
    $('#st_data_death_inc').text(data.statistics.total_death_increase);
}
function remove_comma(n){
  let num = '';
  for(i=0; i<n.length; i++){
    if(n[i]==',') continue;
    num += n[i];
  }
  return parseInt(num);
}
