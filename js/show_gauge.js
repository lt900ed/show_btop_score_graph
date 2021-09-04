function get_csv_data_for_win_rate(path_data, div_id) {
  $.ajax({
    url: path_data,
    type: 'GET',
    dataType: 'text',
    timeout: 5000,
    success: function(res) {
      var arr = csv2array_for_battle_log(res);
      var today_rows = get_today_rows(arr);

      if (today_rows.length == 0) {
        var win_rate = 0
      } else {
        arr_results = today_rows.map(i => {if (i[6] == 'win') {return 1} else {return 0}})
        var win_rate = arr_results.reduce((p, c) => p + c, 0) / arr_results.length
      }

      if (!window.gauge) {
        var g = new JustGage({
          id: div_id,
          hideMinMax: true,
          value: 50,
          min: 0,
          max: 100,
          valueMinFontSize: 30,
          gaugeWidthScale: 1,
          textRenderer: function (val) {
            return Math.round(val) + '%'
          },
          decimals: 0,
          pointer: true,
          pointerOptions: {
            toplength: 0,
            bottomlength: 10,
            bottomwidth: 8,
            color: '#000'
          },
          valueFontColor: 'white',
          counter: true,
          levelColors: [
            "#ff0000",
            "#ff8800",
            "#ffff00",
            "#0088ff",
            "#0000ff"
          ],
          relativeGaugeSize: true
        });
        window.gauge = g
      }
      window.gauge.refresh(win_rate * 100)
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