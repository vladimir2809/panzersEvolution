var canvas = null;
var context = null;
var canvasWidth = 1024;
var canvasHeight = 600;
var size = 40;
var quantityColor = 64;
var quantityPanzer = 64;
var direction = 0;
var panzer = {
    being: true,
    x:1,
    y:1,
    width: 35,
    height: 35,
    sizeTower: 7,
    color: 'white',
    angleBody: 0,
    angleTower: 0,
    towerX:null,
    towerY: null,
    towerX1: null,
    towerY1: null,
    towerLength: 10,
}
var colorArr = [];
panzerArr = [];
window.addEventListener('load', function () {
    preload();
    create();
    setInterval(function () {
        drawAll();
        update();
    },16);
});
function preload() 
{

}
function create()
{
    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");
    // создаем список цветов в градиенте от красновго до синего через зеленый
    for (let i = 0; i < quantityColor;i++)
    {
        let R = 0;
        let G = 0;
        let B = 0;
        let qC = quantityColor;
        let range = qC / 4;
        if (i < range)
        {
            R = 255;
            G = Math.trunc((255 / range * (i)));
        }
        if (i >= range && i<range*2)
        {
            R = Math.trunc(255-(255 / range * (i-range)));
            G=255;
        }
        if (i >= range*2 && i<range*3)
        {
            G = 255;
            B = Math.trunc((255 / range * (i-range*2)));
        }
        if (i >= range*3 && i<range*4)
        {
            G = Math.trunc((255-255 / range * (i-range*3)));
            B=255;
        }
        let color = 'rgb(' + R + ',' + G + ',' + B + ')';
        colorArr.push(color);
    }
    console.log(colorArr);
    // инициализиуем танки
    for (let i = 0; i < quantityPanzer;i++)
    {
        let panzerOne = JSON.parse(JSON.stringify(panzer));
        panzerOne.x = panzerOne.width * ((i % 8))*1.5;
        panzerOne.y = panzerOne.height * Math.trunc((i / 8))*1.5;
        let index = i % quantityColor;
        panzerOne.color = colorArr[index];
        
        panzerArr.push(panzerOne);
        updateStatePanzer(panzerArr[i]);

    }
}
function drawAll() 
{
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvasWidth, canvasHeight);
    for (let i = 0; i < quantityPanzer;i++)
    {
        drawPanzer(panzerArr[i]);
    }
    
}
function drawPanzer(panzer)
{
    var multSide=0.15;


    context.strokeStyle=panzer.color;
    // врашаем тело танка
    context.save();
  
    context.translate(panzer.x + panzer.width / 2, panzer.y + panzer.height / 2); // translate to rectangle center



    context.rotate((Math.PI / 180) * panzer.angleBody/*Math.trunc(panzer.angleBody/90)*90*/); // rotate

    context.translate(-(panzer.x + panzer.width / 2), -(panzer.y + panzer.height / 2)); // translate back

    context.lineWidth = 1;
    //рисуем тело танка
    context.strokeRect(panzer.x, panzer.y, panzer.width*multSide, panzer.height);
    let addX = panzer.width - panzer.width * multSide;
    context.strokeRect(panzer.x+addX, panzer.y, panzer.width*multSide, panzer.height);
    context.strokeRect(panzer.x+panzer.width*multSide, panzer.y+panzer.height*multSide,
                    panzer.width-panzer.width*multSide*2, panzer.height-panzer.height*multSide*2);

    // рисуем кружок башни
    context.beginPath();
    context.arc(panzer.x + panzer.width / 2, panzer.y + panzer.height / 2, panzer.sizeTower, 0,3.14*2, false);
    context.stroke();

    context.restore();
    
    // рисуем пушку
    context.beginPath();
    context.strokeStyle=panzer.color;
    context.lineWidth = 3;
    context.moveTo(panzer.towerX,panzer.towerY);
    context.lineTo(panzer.towerX1,panzer.towerY1);
    context.stroke();  
}
function update() 
{
    for (let i = 0; i < quantityPanzer;i++)
    {
        panzerArr[i].angleBody++;
        panzerArr[i].angleTower-=4;
        if (panzerArr[i].x == 800 && direction==0) direction = 1;
        if (panzerArr[i].x == 1 && direction==1) direction =0;
        if (direction == 0) panzerArr[i].x++;
        if (direction == 1) panzerArr[i].x--;
        updateStatePanzer(panzerArr[i]);
    }
}
function updateStatePanzer(panzer)
{
    let centerX = panzer.x + panzer.width / 2;
    let centerY = panzer.y + panzer.height / 2;
    panzer.towerY = centerY + Math.sin((Math.PI / 180) * panzer.angleTower) * panzer.sizeTower;
    panzer.towerX = centerX + Math.cos((Math.PI / 180) * panzer.angleTower) * panzer.sizeTower;
    panzer.towerY1 = panzer.towerY + Math.sin((Math.PI / 180) * panzer.angleTower) * panzer.towerLength;
    panzer.towerX1 = panzer.towerX + Math.cos((Math.PI / 180) * panzer.angleTower) * panzer.towerLength;
}