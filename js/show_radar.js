function add_radar_graph(ctx, arr_last10) {
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
  var datalabel_size = Math.floor(vw / 15);
  var arr_avg_sd = get_avg_sd_of_results(arr_last10);
  var val_lastgame = arr_last10.slice(-1)[0]
  // console.log(val_lastgame);
  val_lastgame = val_lastgame.map((v, i) => {return get_standard_score(Number(v), arr_avg_sd[i]['avg'], arr_avg_sd[i]['sd'], false)})
  // console.log(val_lastgame);
  val_lastgame[5] = get_standard_score(Number(arr_last10.slice(-1)[0][5]), arr_avg_sd[5]['avg'], arr_avg_sd[5]['sd'], true)
  // console.log(val_lastgame);
  var datalabel_color = val_lastgame.map(v => {
    if (v > 50) {
      return 'aqua'
    } else if (v < 50) {
      return 'lightpink'
    } else {
      return 'white'
    }})

  window.myChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['SCORE', 'ASSIST', 'DMG', 'DIVERSION', 'DEFEAT', 'LOSS', 'CHASE'],
      datasets: [
        {
          label: 'LastResult',
          data: val_lastgame,
          borderColor: clr_today,
          backgroundColor: bgclr_today,
          borderWidth: border_width,
          pointRadius: 0,
          datalabels: { // 月別気温(2019)のデータラベル設定
            align: 'end' // データラベルの位置（'end' は上側）
          }
        },
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
            suggestedMin: 25,
            suggestedMax: 75,
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
              stepSize: 25
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
              size: tick_r_size,
              weight: 'bold'
            }
          }
        },
        datalabels: {
          color: datalabel_color,
          font: {
            size: datalabel_size
          },
          formatter: function(value, context) {
            return Math.round(value);
          }
        }
      }
    }
  });
}

function get_csv_data_for_battle_log(path_data, ctx, is_ground) {
  $.ajax({
    url: path_data,
    type: 'GET',
    dataType: 'text',
    timeout: 5000,
    success: function(res) {
      var arr = csv2array_for_battle_log(res);
      var last10_rows = arr.slice(-10);
      // console.log(last10_rows);
      if (last10_rows.length > 0) {
        last10_rows = last10_rows.map(i => {return i.slice(22)})
        if (window.first_flg || JSON.stringify(window.display_last10_rows) != JSON.stringify(last10_rows)) {
          window.first_flg = false;
          window.display_last10_rows = last10_rows;
          add_radar_graph(ctx, window.display_last10_rows);
        }
      }
    },
    error: function() {
    }
  });
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
  // console.log('get avg')
  // console.log(arr)
  if (arr.length == 0) {
    return [null, null, null, null, null, null, null]
  } else {
    var arr_result = arr
    // console.log(arr_result)
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

function get_avg_sd_of_results(arr) {
  // console.log('get avg and sd')
  // console.log(arr)
  if (arr.length == 0) {
    return [null, null, null, null, null, null, null]
  } else {
    arr_sum = arr.reduce((p, c) => [
      p[0] + Number(c[0]),
      p[1] + Number(c[1]),
      p[2] + Number(c[2]),
      p[3] + Number(c[3]),
      p[4] + Number(c[4]),
      p[5] + Number(c[5]),
      p[6] + Number(c[6])
    ], [0, 0, 0, 0, 0, 0, 0])
    arr_avg = arr_sum.map(i => {return i / arr.length})
    // console.log(arr_avg)
    arr_squared_diff = arr.map(i => {return [
      (i[0] - arr_avg[0]) ** 2,
      (i[1] - arr_avg[1]) ** 2,
      (i[2] - arr_avg[2]) ** 2,
      (i[3] - arr_avg[3]) ** 2,
      (i[4] - arr_avg[4]) ** 2,
      (i[5] - arr_avg[5]) ** 2,
      (i[6] - arr_avg[6]) ** 2
    ]})
    // console.log(arr_squared_diff)
    arr_sum_squared_diff = arr_squared_diff.reduce((p, c) => [
      p[0] + c[0],
      p[1] + c[1],
      p[2] + c[2],
      p[3] + c[3],
      p[4] + c[4],
      p[5] + c[5],
      p[6] + c[6]
    ], [0, 0, 0, 0, 0, 0, 0])
    // console.log(arr_sum_squared_diff)
    arr_sd = arr_sum_squared_diff.map(i => {return Math.sqrt(i / arr.length)})
    // console.log(arr_sd)
    var out = []
    for (let i = 0; i < arr_sd.length; i++) {
      out.push({'avg': arr_avg[i], 'sd': arr_sd[i]})
    }
    // console.log(out)
    return out
  }
}

function get_standard_score(v, avg, sd, reverse) {
  // console.log(v, avg, sd, reverse)
  if (reverse) {
    return -10 * ((v - avg) / sd) + 50
  } else {
    return 10 * ((v - avg) / sd) + 50
  }
}