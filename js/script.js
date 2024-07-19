var canvas = null;
var context = null;
var canvasWidth = 1024;
var canvasHeight = 600;
var size = 40;
var quantityColor = 64;
var quantityPanzer = 64;
var quantityWall = 64;
var direction = 0;
var numSelectPanzer = 0;
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
    dir:0,
    speed:10,
    towerX:null,
    towerY: null,
    towerX1: null,
    towerY1: null,
    towerLength: 10,
}
var wall = {
    x:null,
    y:null,
    width: size,
    height: size,
    type: 0,
    color: 'grey',
}
var map = {
    x:0,
    y:0,
    width: 800,
    height: 600,
}
var camera = {
    x:0,
    y:0,
    width: 800,
    height: 600, 
}

var colorArr = [];
var panzerArr = [];
var wallArr = [];

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
    initKeyboardAndMouse(['KeyA', 'KeyW', 'KeyS', 'KeyD']);
    srand(2);
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
    for (let i = 0; i < quantityWall;i++)
    {
        let wallOne=JSON.parse(JSON.stringify(wall));
        let x = randomInteger(0,Math.trunc(map.width / wallOne.width)-1);
        let y = randomInteger(0,Math.trunc(map.height / wallOne.width)-1);;
        wallOne.x = x * wallOne.width;
        wallOne.y = y * wallOne.width;
        wallArr.push(wallOne);
    }
    // инициализиуем танки
    for (let i = 0; i < quantityPanzer;i++)
    {
        let panzerOne = JSON.parse(JSON.stringify(panzer));
        let flag = false;
        do {
            let x = randomInteger(0,Math.trunc(map.width / wall.width)-1);
            let y = randomInteger(0,Math.trunc(map.height / wall.width)-1);;
            panzerOne.x = x * wall.width;
            panzerOne.y = y * wall.width;
 
        } while (collisionPanzerWall(panzerOne) == true ||
            collisionPanzerToPanzer(panzerOne,null) == true);
        let index = i % quantityColor;
        panzerOne.color = colorArr[index];
        
        panzerArr.push(panzerOne);
        updateStatePanzer(panzerArr[i]);
    }

    //console.log(wallArr);
}
function drawAll() 
{
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvasWidth, canvasHeight);
    for (let i = 0; i < quantityPanzer;i++)
    {
        if (numSelectPanzer==i)
        {
            drawPanzer(panzerArr[i],true);

        }
        else
        {
            drawPanzer(panzerArr[i]);
        }
    }
    for (let i = 0; i < quantityWall;i++)
    {
        drawWall(wallArr[i]);
    }
    
}
function drawWall(wall)
{
    context.fillStyle = wall.color;
    context.fillRect(wall.x, wall.y, wall.width, wall.height);
}
function drawPanzer(panzer,select=false)
{
    var multSide=0.15;


    if (select) 
    {
        context.strokeStyle = 'white';
    }
    else
    {
        context.strokeStyle=panzer.color;
    }
    
    // врашаем тело танка
    context.save();
  
    context.translate(panzer.x + panzer.width / 2, panzer.y + panzer.height / 2); // translate to rectangle center



    context.rotate((Math.PI / 180) * (panzer.angleBody+90)/*Math.trunc(panzer.angleBody/90)*90*/); // rotate

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
    context.lineWidth = 3;
    context.moveTo(panzer.towerX,panzer.towerY);
    context.lineTo(panzer.towerX1,panzer.towerY1);
    context.stroke();  
}
function update() 
{
    for (let i = 0; i < quantityPanzer;i++)
    {
        //panzerArr[i].angleBody++;
        //panzerArr[i].angleTower-=4;
       /* if (panzerArr[i].x == 800 && direction==0) direction = 1;
        if (panzerArr[i].x == 1 && direction==1) direction =0;
        if (direction == 0) panzerArr[i].x++;
        if (direction == 1) panzerArr[i].x--;*/
        if (numSelectPanzer==i)
        {
            controlHumanPanzer(panzerArr[i]);
            collisionPanzerWall(panzerArr[i]);
            collisionRectangleMap(panzerArr[i]);
            collisionPanzerToPanzer(panzerArr[i],i)
          
        }
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
function controlHumanPanzer(panzer)
{
    if (checkPressKey('KeyW') == true && panzer.dir!=0) {panzer.dir=0; panzer.angleTower=panzer.angleBody=270}
    if (checkPressKey('KeyD') == true && panzer.dir!=1) {panzer.dir=1; panzer.angleTower=panzer.angleBody=0}
    if (checkPressKey('KeyS') == true && panzer.dir!=2) {panzer.dir=2; panzer.angleTower=panzer.angleBody=90}
    if (checkPressKey('KeyA') == true && panzer.dir!=3) {panzer.dir=3; panzer.angleTower=panzer.angleBody=180}

    if (checkPressKey('KeyW') == true && panzer.dir==0) panzer.y-=panzer.speed;
    else if (checkPressKey('KeyD') == true && panzer.dir==1) panzer.x+=panzer.speed;
    else if (checkPressKey('KeyS') == true && panzer.dir==2) panzer.y+=panzer.speed;
    else if (checkPressKey('KeyA') == true && panzer.dir==3) panzer.x-=panzer.speed;

   
}
function collisionPanzerWall(panzer)
{
    for (let i = 0; i < quantityWall;i++)
    {
        if (panzer.x+panzer.width>wallArr[i].x && 
            panzer.x<wallArr[i].x+wallArr[i].width &&
            panzer.y+panzer.height>wallArr[i].y && 
            panzer.y<wallArr[i].y+wallArr[i].height 
            )
        {
            if ( panzer.dir==0)
            {
                panzer.y = wallArr[i].y + wallArr[i].height + 2;
                return true;
            }
            if ( panzer.dir==2)
            {
                panzer.y = wallArr[i].y - panzer.height - 2;
                return true;;
            }

            
           
            if (panzer.dir==3)
            {
                panzer.x = wallArr[i].x + wallArr[i].width + 1;
                return true;;
            }
            if  (panzer.dir==1)
            {
                panzer.x = wallArr[i].x - panzer.width - 1;
                return true;;
            }

           
        }

    }
    return false;   
}
function collisionRectangleMap(panzer)
{
    if (panzer.x<map.x)
    {
        panzer.x = map.x+1;
        return true;
    }
    if (panzer.x+panzer.width>map.x+map.width)
    {
        panzer.x = map.x+map.width-panzer.width-1;
        return true;
    }

    if (panzer.y<map.y)
    {
        panzer.y = map.y+1;
        return true;
    }
    if (panzer.y+panzer.height>map.y+map.height)
    {
        panzer.y = map.y+map.height-panzer.height-1;
        return true;
    }
    return false;
}
function collisionPanzerToPanzer(panzer,num)
{
    for (let i = 0; i < panzerArr.length;i++)
    {
        if (num!=i)
        {
            console.log(panzerArr[i]);
            if (panzer.x+panzer.width>panzerArr[i].x &&
                panzer.x<panzerArr[i].x+panzerArr[i].width &&
                panzer.y+panzer.height>panzerArr[i].y &&
                panzer.y<panzerArr[i].y+panzerArr[i].height )
            {
                if ( panzer.dir==0)
                {
                    panzer.y = panzerArr[i].y + panzerArr[i].height + 2;
                    return true;
                }
                if ( panzer.dir==2)
                {
                    panzer.y = panzerArr[i].y - panzer.height - 2;
                    return true;;
                }

            
           
                if (panzer.dir==3)
                {
                    panzer.x = panzerArr[i].x + panzerArr[i].width + 1;
                    return true;;
                }
                if  (panzer.dir==1)
                {
                    panzer.x = panzerArr[i].x - panzer.width - 1;
                    return true;;
                }
            }
        }
    }
    return false;
}