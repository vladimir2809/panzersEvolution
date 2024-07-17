var canvas = null;
var context = null;
var canvasWidth = 1024;
var canvasHeight = 600;
var size = 40;
var iterColor = 0;
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
    for (let i = 0; i < 64;i++)
    {
        let R =i<32 ? 255 : Math.trunc(255-(255/32*(i-32)));
        let G = i<32 ? Math.trunc((255/32*(i-32))):Math.trunc(255-(255/32*(i-32))) ;
        let B = 0;
        let color = 'rgb(' + R + ',' + G + ',' + B + ')';
        colorArr.push(color);
    }
    console.log(colorArr);
    updateStatePanzer(panzer);
}
function drawAll() 
{
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvasWidth, canvasHeight);
    drawPanzer(panzer);
}
function drawPanzer(panzer)
{
    var multSide=0.15;
    context.strokeStyle=panzer.color;
    context.save();
    context.translate(panzer.x + panzer.width / 2, panzer.y + panzer.height / 2); // translate to rectangle center
 
    context.rotate((Math.PI / 180) * panzer.angleBody); // rotate
    context.translate(-(panzer.x + panzer.width / 2), -(panzer.y + panzer.height / 2)); // translate back
    context.strokeRect(panzer.x, panzer.y, panzer.width*multSide, panzer.height);
    let addX = panzer.width - panzer.width * multSide;
    context.strokeRect(panzer.x+addX, panzer.y, panzer.width*multSide, panzer.height);
    context.strokeRect(panzer.x+panzer.width*multSide, panzer.y+panzer.height*multSide,
                    panzer.width-panzer.width*multSide*2, panzer.height-panzer.height*multSide*2);
    context.beginPath();
    context.arc(panzer.x + panzer.width / 2, panzer.y + panzer.height / 2, panzer.sizeTower, 0,3.14*2, false);
    context.stroke();
    context.beginPath();
    context.lineWidth = 3;
    context.moveTo(panzer.towerX,panzer.towerY);
    context.lineTo(panzer.towerX1,panzer.towerY1);
    context.stroke();
    /*context.translate(panzer.x + panzer.width / 2, panzer.y + panzer.height / 2); // translate to rectangle center
 
    context.rotate((Math.PI / 180) * 125); // rotate*/
    context.restore();
}
function update() 
{
    panzer.angleBody++;
    panzer.angleTower-=2;
    updateStatePanzer(panzer);
    iterColor++;
    iterColor %= 64;
    panzer.color = colorArr[iterColor];
}
function updateStatePanzer(panzer)
{
    let centerX = panzer.x + panzer.width / 2;
    let centerY = panzer.y + panzer.height / 2;
    panzer.towerY = centerX + Math.sin((Math.PI / 180) * panzer.angleTower) * panzer.sizeTower;
    panzer.towerX = centerY + Math.cos((Math.PI / 180) * panzer.angleTower) * panzer.sizeTower;
    panzer.towerY1 = panzer.towerY + Math.sin((Math.PI / 180) * panzer.angleTower) * panzer.towerLength;
    panzer.towerX1 = panzer.towerX + Math.cos((Math.PI / 180) * panzer.angleTower) * panzer.towerLength;

}