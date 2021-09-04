function add_radar_graph(ctx, arr_today, arr_lastday) {
  if (window.myChart) {
    window.myChart.destroy();
  }

  var clr_today = "rgba(0, 242, 255)"
  var clr_lastday = "rgba(241, 86, 40)"
  var bgclr_today = "rgba(0, 242, 255, 0.3)"
  var bgclr_lastday = "rgba(241, 86, 40, 0.3)"
  var vw = $(window).width();
  var border_width = Math.floor(vw / 80);
  var tick_x_size = Math.floor(vw / 25);
  var tick_y_size = Math.floor(vw / 20);
  var tick_r_size = Math.floor(vw / 20);
  var arr_today = get_avg_of_results(arr_today);
  var arr_lastday = get_avg_of_results(arr_lastday);
  console.log(arr_today);
  console.log(arr_lastday);
  console.log('calc limit');
  var arr_limit = []
  for (let i = 0; i < arr_today.length; i++) {
    arr_limit.push(Math.max(arr_today[i], arr_lastday[i]))
  }
  if (Number.isFinite(arr_today[5]) && Number.isFinite(arr_lastday[5])) {
    arr_limit[5] = Math.min(arr_today[5], arr_lastday[5])
  } else if (Number.isFinite(arr_today[5])) {
    arr_limit[5] = arr_today[5]
  } else {
    arr_limit[5] = arr_lastday[5]
  }
  var val_today = arr_today.map(function(r, i) {return r / arr_limit[i]})
  var val_lastday = arr_lastday.map(function(r, i) {return r / arr_limit[i]})
  val_today[5] = 1 / val_today[5]
  val_lastday[5] = 1 / val_lastday[5]
  console.log(arr_limit);
  console.log(val_today);
  console.log(val_lastday);


  window.myChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['SCORE', 'ASSIST', 'DMG', 'DIVERSION', 'DEFEAT', 'LOSS', 'CHASE'],
      datasets: [
        {
          label: 'Today',
          data: val_today,
          borderColor: clr_today,
          backgroundColor: bgclr_today,
          borderWidth: border_width,
          pointRadius: 0
        },
        {
          label: 'Lastday',
          data: val_lastday,
          borderColor: clr_lastday,
          backgroundColor: bgclr_lastday,
          borderWidth: border_width,
          pointRadius: 0
        }
      ],
    },
    options: {
      title: {
        display: false
      },
      scales: {
        r: {
            angleLines: {
              display: true,
              color: 'gray'
            },
            suggestedMin: 0,
            suggestedMax: 1,
            pointLabels: {
              color: 'white',
              font: {
                size: tick_r_size
              }
            },
            grid: {
              display: true,
              color: 'white'
            },
            ticks: {
              display: false,
              stepSize: 0.25
            }
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          align: 'center',
          labels: {
            color: 'white',
            font: {
              size: tick_r_size
            }
          }
        }
      }
    }
  });
}

function step_by_step(ctx, is_ground) {
  window.val.push(window.val[window.val.length - 1] + 1)
  add_graph(ctx, is_ground, window.val);
}

function regularly_update(ctx, is_ground) {
  window.val.push(window.val[window.val.length - 1] + 1)
  add_graph(ctx, is_ground, window.val);
}

function get_csv_data_for_battle_log(path_data, ctx, is_ground) {
  $.ajax({
    url: path_data,
    type: 'GET',
    dataType: 'text',
    timeout: 5000,
    success: function(res) {
      var arr = csv2array_for_battle_log(res);
      var today_rows = get_today_rows(arr);
      var lastday_rows = get_lastday_rows(arr);
      console.log(today_rows);
      console.log(lastday_rows);
      if (window.first_flg || window.display_today_rows.length != today_rows.length) {
        window.first_flg = false;
        window.display_today_rows = today_rows;
        window.display_lastday_rows = lastday_rows;
        add_radar_graph(ctx, window.display_today_rows, window.display_lastday_rows);
      }
    },
    error: function() {
    }
  });
}

function get_today_rows(arr) {
  var btop_date_today = get_btop_date(new Date())
  if (arr.length == 0) {
    return [];
  } else if (arr.length == 1 && new Date(arr[0][0]) > btop_date_today) {
    return arr
  } else {
    var index = 0
    arr.forEach(function(row, i) {
      if (i > 0) {
        if (new Date(row[0]) < btop_date_today) {
          index = i
        }
      }
    });
    var today_rows = arr.slice(index + 1);
    return today_rows
  }
}

function get_lastday_rows(arr) {
  var index = 0
  var btop_date_today = get_btop_date(new Date())
  var tmp_btop_dates = [];
  arr.forEach(function(row, i) {
    tmp_btop_dates.push(get_btop_date(new Date(row[0])).getTime());
  });
  var btop_dates = Array.from(new Set(tmp_btop_dates));
  btop_dates = btop_dates.filter(item => item != btop_date_today.getTime());
  if (btop_dates.length == 0) {
    return [];
  } else {
    btop_date_lastday = new Date(btop_dates.reduce((a,b)=>Math.max(a,b)));

    var lastday_rows = arr.filter(row => get_btop_date(new Date(row[0])).getTime() == btop_date_lastday.getTime());
    // console.log(lastday_rows);
    return lastday_rows
  }
}

function csv2array_for_battle_log(data) {
  const dataArray = [];
  const dataString = data.split('\n');
  var tmp_arr;
  for (let i = 1; i < dataString.length; i++) {
    tmp_arr = dataString[i].split(',');
    if (tmp_arr.length == 29) {
      dataArray[i - 1] = tmp_arr;
    }
  }
  return dataArray;
}

function get_btop_date(date) {
  date_start = date
  if (date.getHours() < 5) {
    date_start.setDate(date.getDate() - 1)
  }
  return new Date(date_start.getFullYear(), date_start.getMonth(), date_start.getDate(), 5, 0, 0)
}

function get_avg_of_results(arr) {
  console.log('get avg')
  console.log(arr)
  if (arr.length == 0) {
    return [null, null, null, null, null, null, null]
  } else {
    var arr_result = arr.map(i => {return i.slice(22)})
    console.log(arr_result)
    arr_sum = arr_result.reduce((p, c) => [
      p[0] + Number(c[0]),
      p[1] + Number(c[1]),
      p[2] + Number(c[2]),
      p[3] + Number(c[3]),
      p[4] + Number(c[4]),
      p[5] + Number(c[5]),
      p[6] + Number(c[6])
    ], [0, 0, 0, 0, 0, 0, 0])
    return arr_sum.map(i => {return i / arr.length})
  }
}