// taken from http://jsfiddle.net/wLWuS/11/
function date2str(d, format) {
  var z = {
    y: d.getFullYear(),
    M: d.getMonth() + 1,
    d: d.getDate(),
    h: d.getHours(),
    m: d.getMinutes(),
    s: d.getSeconds(),
    n: d.getMilliseconds()
  };
  return format.replace(/(y+|M+|d+|h+|m+|s+|n+)/g, function (v) {
    // return ('0' + eval('z.'+v.slice(-1)) ).slice( -(v.length>2?v.length:2) );
    return ('0' + z[v.slice(-1)]).slice(-(v.length > 2 ? v.length : 2));
  }); // v.length>2?v.length:2  allows y-M-d to produce yy-MM-dd
}

exports.date2str = date2str;
