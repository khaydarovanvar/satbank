// Generic SVG figure builders for native (non-cropped) question figures.
function esc(s){ return String(s); }

// Small inline scatter icon, used as answer-choice content (e.g. "which graph
// shows a strong positive association"). points are in a 0-10 x 0-10 box.
function miniScatterIcon(points){
  var w=110,h=70,pad=8;
  var x=v=>pad+(w-2*pad)*v/10, y=v=>h-pad-(h-2*pad)*v/10;
  var dots = points.map(p=>'<circle cx="'+x(p[0])+'" cy="'+y(p[1])+'" r="2.6" fill="#111"/>').join('');
  return '<svg width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'" style="vertical-align:middle">'+
    '<line x1="'+pad+'" y1="'+(h-pad)+'" x2="'+(w-pad)+'" y2="'+(h-pad)+'" stroke="#999"/>'+
    '<line x1="'+pad+'" y1="'+(h-pad)+'" x2="'+pad+'" y2="'+pad+'" stroke="#999"/>'+
    dots+'</svg>';
}

function dotPlotSVG(datasets, opts){
  opts = opts||{};
  var rowH = 150, gap = 34, padL = 50, padR = 30, padT = 26, padB = 30;
  var w = opts.width || 560;
  var h = padT + datasets.length*(rowH) + (datasets.length-1)*gap + padB;
  var svg = '<svg width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'">';
  datasets.forEach(function(ds, di){
    var vals = Object.keys(ds.counts).map(Number).sort((a,b)=>a-b);
    var minV = ds.xmin!==undefined?ds.xmin:vals[0];
    var maxV = ds.xmax!==undefined?ds.xmax:vals[vals.length-1];
    var innerW = w-padL-padR;
    var x = v => padL + innerW*(v-minV)/(maxV-minV);
    var topY = padT + di*(rowH+gap);
    var baseY = topY + rowH - 24;
    var maxCount = Math.max.apply(null, vals.map(v=>ds.counts[v]||0));
    var dotR = Math.min(7, (rowH-40)/(maxCount+1)/2);
    if(ds.label) svg += '<text x="'+padL+'" y="'+(topY)+'" font-size="13" font-weight="700" fill="#0b3b57">'+esc(ds.label)+'</text>';
    svg += '<line x1="'+padL+'" y1="'+baseY+'" x2="'+(w-padR)+'" y2="'+baseY+'" stroke="#888" stroke-width="1.2"/>';
    for(var v=minV; v<=maxV; v++){
      svg += '<line x1="'+x(v)+'" y1="'+(baseY-4)+'" x2="'+x(v)+'" y2="'+(baseY+4)+'" stroke="#888"/>';
      svg += '<text x="'+x(v)+'" y="'+(baseY+18)+'" font-size="11" fill="#555" text-anchor="middle">'+v+'</text>';
      var c = ds.counts[v]||0;
      for(var k=0;k<c;k++){
        svg += '<circle cx="'+x(v)+'" cy="'+(baseY-6-k*(2*dotR+2))+'" r="'+dotR+'" fill="#0b3b57"/>';
      }
    }
  });
  svg += '</svg>';
  return svg;
}

function boxPlotSVG(datasets, opts){
  opts = opts||{};
  var w = opts.width||560;
  var rowH = 46, padL=60, padR=20, padT=26, padB=40;
  var allMin = Math.min.apply(null, datasets.map(d=>d.min));
  var allMax = Math.max.apply(null, datasets.map(d=>d.max));
  var axisMin = opts.axisMin!==undefined?opts.axisMin:Math.floor(allMin/5)*5-2;
  var axisMax = opts.axisMax!==undefined?opts.axisMax:Math.ceil(allMax/5)*5+2;
  var h = padT + datasets.length*rowH + padB;
  var innerW = w-padL-padR;
  var x = v => padL + innerW*(v-axisMin)/(axisMax-axisMin);
  var svg = '<svg width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'">';
  datasets.forEach(function(d, i){
    var cy = padT + i*rowH + rowH/2 - 6;
    svg += '<text x="4" y="'+(cy+5)+'" font-size="13" font-weight="700" fill="#0b3b57">'+esc(d.label)+'</text>';
    svg += '<line x1="'+x(d.min)+'" y1="'+cy+'" x2="'+x(d.q1)+'" y2="'+cy+'" stroke="#0b3b57" stroke-width="2"/>';
    svg += '<line x1="'+x(d.min)+'" y1="'+(cy-10)+'" x2="'+x(d.min)+'" y2="'+(cy+10)+'" stroke="#0b3b57" stroke-width="2"/>';
    svg += '<rect x="'+x(d.q1)+'" y="'+(cy-12)+'" width="'+(x(d.q3)-x(d.q1))+'" height="24" fill="#dceaf4" stroke="#0b3b57" stroke-width="2"/>';
    svg += '<line x1="'+x(d.median)+'" y1="'+(cy-12)+'" x2="'+x(d.median)+'" y2="'+(cy+12)+'" stroke="#c0392b" stroke-width="2.5"/>';
    svg += '<line x1="'+x(d.q3)+'" y1="'+cy+'" x2="'+x(d.max)+'" y2="'+cy+'" stroke="#0b3b57" stroke-width="2"/>';
    svg += '<line x1="'+x(d.max)+'" y1="'+(cy-10)+'" x2="'+x(d.max)+'" y2="'+(cy+10)+'" stroke="#0b3b57" stroke-width="2"/>';
  });
  var axisY = padT + datasets.length*rowH + 2;
  svg += '<line x1="'+padL+'" y1="'+axisY+'" x2="'+(w-padR)+'" y2="'+axisY+'" stroke="#888"/>';
  var step = opts.step || 2;
  for(var v=axisMin; v<=axisMax; v+=step){
    svg += '<line x1="'+x(v)+'" y1="'+(axisY-4)+'" x2="'+x(v)+'" y2="'+(axisY+4)+'" stroke="#888"/>';
    svg += '<text x="'+x(v)+'" y="'+(axisY+18)+'" font-size="11" fill="#555" text-anchor="middle">'+v+'</text>';
  }
  if(opts.xlabel) svg += '<text x="'+(padL+innerW/2)+'" y="'+(axisY+34)+'" font-size="12" fill="#555" text-anchor="middle">'+esc(opts.xlabel)+'<\/text>';
  svg += '</svg>';
  return svg;
}

function histogramSVG(panels, opts){
  opts = opts||{};
  var panelW = opts.panelW||260, h = opts.height||240;
  var padL=40,padR=10,padT=28,padB=44;
  var w = panels.length*panelW + (panels.length-1)*20;
  var svg = '<svg width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'">';
  panels.forEach(function(p, pi){
    var ox = pi*(panelW+20);
    var maxF = opts.maxF || Math.max.apply(null, p.bins.map(b=>b.freq)) + 2;
    var innerW = panelW-padL-padR, innerH = h-padT-padB;
    var xmin = p.bins[0].x0, xmax = p.bins[p.bins.length-1].x1;
    var xr = v => ox+padL + innerW*(v-xmin)/(xmax-xmin);
    var yr = f => padT + innerH*(1-f/maxF);
    svg += '<text x="'+(ox+panelW/2)+'" y="16" font-size="13" font-weight="700" text-anchor="middle" fill="#0b3b57">'+esc(p.label)+'</text>';
    [0,2,4,6,8,10,12].forEach(function(f){ if(f<=maxF){
      svg += '<line x1="'+(ox+padL)+'" y1="'+yr(f)+'" x2="'+(ox+panelW-padR)+'" y2="'+yr(f)+'" stroke="#eee"/>';
      svg += '<text x="'+(ox+padL-6)+'" y="'+(yr(f)+4)+'" font-size="10" fill="#777" text-anchor="end">'+f+'</text>';
    }});
    p.bins.forEach(function(b){
      svg += '<rect x="'+xr(b.x0)+'" y="'+yr(b.freq)+'" width="'+(xr(b.x1)-xr(b.x0))+'" height="'+(yr(0)-yr(b.freq))+'" fill="#c9c9c9" stroke="#333"/>';
    });
    for(var v=xmin; v<=xmax; v+=(opts.xstep||10)){
      svg += '<text x="'+xr(v)+'" y="'+(yr(0)+16)+'" font-size="10" fill="#555" text-anchor="middle">'+v+'</text>';
    }
    svg += '<text x="'+(ox+padL/2-4)+'" y="'+(padT-10)+'" font-size="10" fill="#555">Freq.</text>';
    svg += '<text x="'+(ox+panelW/2)+'" y="'+(h-4)+'" font-size="11" fill="#555" text-anchor="middle">'+(opts.xlabel||'Integer')+'</text>';
  });
  svg += '</svg>';
  return svg;
}

function barGraphSVG(opts){
  var w = opts.width||400, h = opts.height||260;
  var padL=44,padR=14,padT=20,padB=44;
  var innerW=w-padL-padR, innerH=h-padT-padB;
  var maxV = opts.maxV || Math.max.apply(null, opts.values)*1.15;
  var n = opts.categories.length;
  var bw = innerW/n*0.6, gap = innerW/n;
  var yr = v => padT + innerH*(1-v/maxV);
  var svg = '<svg width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'">';
  svg += '<line x1="'+padL+'" y1="'+yr(0)+'" x2="'+(w-padR)+'" y2="'+yr(0)+'" stroke="#333"/>';
  svg += '<line x1="'+padL+'" y1="'+padT+'" x2="'+padL+'" y2="'+yr(0)+'" stroke="#333"/>';
  var step = opts.ystep || Math.ceil(maxV/6/5)*5;
  for(var g=0; g<=maxV; g+=step){
    svg += '<line x1="'+padL+'" y1="'+yr(g)+'" x2="'+(w-padR)+'" y2="'+yr(g)+'" stroke="#eee"/>';
    svg += '<text x="'+(padL-6)+'" y="'+(yr(g)+4)+'" font-size="10" fill="#555" text-anchor="end">'+g+'</text>';
  }
  opts.categories.forEach(function(c,i){
    var cx = padL + gap*i + gap/2;
    var v = opts.values[i];
    svg += '<rect x="'+(cx-bw/2)+'" y="'+yr(v)+'" width="'+bw+'" height="'+(yr(0)-yr(v))+'" fill="#c9c9c9" stroke="#333"/>';
    svg += '<text x="'+cx+'" y="'+(yr(0)+16)+'" font-size="10" fill="#555" text-anchor="middle">'+esc(c)+'</text>';
  });
  if(opts.ylabel) svg += '<text x="12" y="'+(padT+innerH/2)+'" font-size="10" fill="#555" text-anchor="middle" transform="rotate(-90 12 '+(padT+innerH/2)+')">'+esc(opts.ylabel)+'</text>';
  if(opts.xlabel) svg += '<text x="'+(padL+innerW/2)+'" y="'+(h-4)+'" font-size="11" fill="#555" text-anchor="middle">'+esc(opts.xlabel)+'</text>';
  svg += '</svg>';
  return svg;
}

function lineGraphSVG(opts){
  var w = opts.width||560, h = opts.height||240;
  var padL=50,padR=16,padT=18,padB=48;
  var innerW=w-padL-padR, innerH=h-padT-padB;
  var xs = opts.xvals, ys = opts.yvals;
  var ymax = opts.ymax!==undefined?opts.ymax:Math.max.apply(null,ys)*1.1;
  var ymin = opts.ymin!==undefined?opts.ymin:0;
  var x = i => padL + innerW*i/(xs.length-1);
  var y = v => padT + innerH*(1-(v-ymin)/(ymax-ymin));
  var svg = '<svg width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'">';
  var step = opts.ystep || Math.ceil((ymax-ymin)/6);
  for(var g=ymin; g<=ymax; g+=step){
    svg += '<line x1="'+padL+'" y1="'+y(g)+'" x2="'+(w-padR)+'" y2="'+y(g)+'" stroke="#e3e3e3"/>';
    svg += '<text x="'+(padL-8)+'" y="'+(y(g)+4)+'" font-size="10" fill="#777" text-anchor="end">'+g+'</text>';
  }
  var pts = xs.map((xv,i)=>x(i)+','+y(ys[i])).join(' ');
  svg += '<polyline points="'+pts+'" fill="none" stroke="#0b3b57" stroke-width="2"/>';
  xs.forEach(function(xv,i){ svg += '<circle cx="'+x(i)+'" cy="'+y(ys[i])+'" r="2.5" fill="#0b3b57"/>'; });
  (opts.annotations||[]).forEach(function(a){
    svg += '<text x="'+(x(a.i)+6)+'" y="'+(y(ys[a.i])-8)+'" font-size="11" fill="#0b3b57" font-weight="700">'+esc(a.label)+'</text>';
  });
  xs.forEach(function(xv,i){
    svg += '<text x="'+x(i)+'" y="'+(y(ymin)+14)+'" font-size="9" fill="#777" text-anchor="end" transform="rotate(-55 '+x(i)+' '+(y(ymin)+14)+')">'+xv+'</text>';
  });
  if(opts.ylabel) svg += '<text x="-'+(padT+innerH/2)+'" y="14" font-size="11" fill="#777" transform="rotate(-90)">'+esc(opts.ylabel)+'</text>';
  if(opts.title) svg += '<text x="'+(padL+innerW/2)+'" y="12" font-size="12" font-weight="700" fill="#0b3b57" text-anchor="middle">'+esc(opts.title)+'</text>';
  svg += '</svg>';
  return svg;
}

// scatterplot with optional straight or curved line of best fit
function scatterSVG(opts){
  var w = opts.width||400, h = opts.height||320;
  var padL=50,padR=16,padT=opts.title?30:16,padB=44;
  var innerW=w-padL-padR, innerH=h-padT-padB;
  var xmin=opts.xmin, xmax=opts.xmax, ymin=opts.ymin, ymax=opts.ymax;
  var x = v => padL + innerW*(v-xmin)/(xmax-xmin);
  var y = v => padT + innerH*(1-(v-ymin)/(ymax-ymin));
  var svg = '<svg width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'">';
  if(opts.title) svg += '<text x="'+(padL+innerW/2)+'" y="14" font-size="12" font-weight="700" text-anchor="middle" fill="#333">'+esc(opts.title)+'</text>';
  svg += '<line x1="'+padL+'" y1="'+y(ymin)+'" x2="'+(w-padR)+'" y2="'+y(ymin)+'" stroke="#333"/>';
  svg += '<line x1="'+padL+'" y1="'+padT+'" x2="'+padL+'" y2="'+y(ymin)+'" stroke="#333"/>';
  var xstep = opts.xstep || Math.ceil((xmax-xmin)/8);
  var ystep = opts.ystep || Math.ceil((ymax-ymin)/8);
  for(var xv=xmin; xv<=xmax; xv+=xstep) svg += '<text x="'+x(xv)+'" y="'+(y(ymin)+16)+'" font-size="10" fill="#555" text-anchor="middle">'+xv+'</text>';
  for(var yv=ymin; yv<=ymax; yv+=ystep) svg += '<text x="'+(padL-6)+'" y="'+(y(yv)+4)+'" font-size="10" fill="#555" text-anchor="end">'+yv+'</text>';
  if(opts.line){
    var L = opts.line;
    if(L.type==='curve' && L.points){
      var d = 'M'+L.points.map(p=>x(p[0])+','+y(p[1])).join(' L');
      svg += '<path d="'+d+'" fill="none" stroke="#111" stroke-width="2"/>';
    } else {
      var x1=L.x1!==undefined?L.x1:xmin, x2=L.x2!==undefined?L.x2:xmax;
      var y1=L.slope*x1+L.intercept, y2=L.slope*x2+L.intercept;
      svg += '<line x1="'+x(x1)+'" y1="'+y(y1)+'" x2="'+x(x2)+'" y2="'+y(y2)+'" stroke="#111" stroke-width="2"/>';
    }
  }
  opts.points.forEach(function(p){
    svg += '<circle cx="'+x(p[0])+'" cy="'+y(p[1])+'" r="3.2" fill="#111"/>';
  });
  if(opts.xlabel) svg += '<text x="'+(padL+innerW/2)+'" y="'+(h-4)+'" font-size="11" fill="#555" text-anchor="middle">'+esc(opts.xlabel)+'</text>';
  if(opts.ylabel) svg += '<text x="-'+(padT+innerH/2)+'" y="14" font-size="11" fill="#555" transform="rotate(-90)">'+esc(opts.ylabel)+'</text>';
  svg += '</svg>';
  return svg;
}

function renderFigure(fig){
  if(!fig) return '';
  if(fig.type==='dotplot') return dotPlotSVG(fig.datasets, fig.opts);
  if(fig.type==='boxplot') return boxPlotSVG(fig.datasets, fig.opts);
  if(fig.type==='histogram') return histogramSVG(fig.panels, fig.opts);
  if(fig.type==='bar') return barGraphSVG(fig.opts);
  if(fig.type==='line') return lineGraphSVG(fig.opts);
  if(fig.type==='scatter') return scatterSVG(fig.opts);
  return '';
}
