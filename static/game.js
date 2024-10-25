
var canvas = null;
var context = null;
/*var canvasWidth = 1024;
var canvasHeight = 600*/;
let screenWidth = 1124;
let screenHeight = 768;
var windowWidth = 1124;
var windowHeight = 768;
var windowWidthOld = windowWidth;
var windowHeighOld = windowHeight;
var  canvasWidth= windowWidth;
var  canvasHeight= windowHeight;
var canvasWidthMore = true;
var flagScaling = false;
var scale = 0.5;
var size = 40;

var imageArr=new Map();// массив картинок
var nameImageArr = ['energy','patrons','HP'];
var countLoadImage=0;// количество загруженных картинок

var quantityColor = 4;//64
var quantityBullet = 150;
var quantityBurst = 150;
var quantityTeam = 4;
var quantityPanzer = 32// 64;
var quantityWall = 64;
var quantityBonus = 150;

var progresslevel = [];
var level = 1;

var modeGame = 'GOD';// 'GOD', 'HERO', 'EGREGOR'

var bonuses = null;
var bullets =null;
var burst = null;
var numSelectPanzer = 0;
var numGenesPanzer = 0;
var visible = true;
var wall = {
    being:false,
    x:null,
    y:null,
    width: size,
    height: size,
    type: 0,
    color: 'grey',
    lineArr:[],// массив линий для определение пересечения с прямой при расчетах
}
var map = {
    x:0,
    y:0,
    width: 800*2,
    height: 600*2,
}
var camera = {
    x:0,
    y:0,
    width: 800,
    height: 600, 
}
var  widthSide = screenWidth - camera.width;
var  heightSide = screenHeight - camera.height;
var panzerArr = [];
var wallArr = [];

var maxParam = {
    maxHP:2000,
    speed:30,
    damage: 100,
    accuracy: 100,
    speedAttack: 100,
}

var dataForGet = {
    wallArr:['being','x','y','color','being',"width",'height'],
    burstArr:['being','x','y','count'],
    bulletArr:['being','x','y'],
    panzerArr:['being','x','y','color','angleBody','angleTower','towerX',
        'towerY','towerX1','towerY1',/*'centerX','centerY',*//*'towerLength',*/'sizeTower',"width",'height'],
    bonusArr:['being',"x",'y','type',"width",'height']
}
var socket = io();
socket.on('message', function(data) {
    console.log(data);
});
socket.on('dataDraw', function (data) {
   // console.log(JSON.parse(data));
    data = JSON.parse(data);
    panzerArr = JSON.parse(JSON.stringify(data.panzerArr));
    wallArr = JSON.parse(JSON.stringify(data.wallArr));
    burst.burstArr = JSON.parse(JSON.stringify(data.burstArr));
    bonuses.bonusArr = JSON.parse(JSON.stringify(data.bonusArr));
    bullets.bulletArr = JSON.parse(JSON.stringify(data.bulletArr));
    //console.log(Arr);
   /* drawAll();*/
});
setInterval(function () {
    update();
    drawAll();
}, 16);

function update() 
{
    cameraMove();
    if (keyUpDuration('NumpadSubtract',100)==true)
    {
        scale*=0.75;
        camera.x = 1;
        camera.y = 1;
    }
    if (keyUpDuration('NumpadAdd',100)==true)
    {
        scale*=1.333;
       // alert(scale);
    }
}

function cameraMove()// движение камеры от клавиатуры
{
    let speedMoveCamera = 10;
    if (checkPressKey('KeyW'))
    {
        if (camera.y>0) 
        {
            camera.y-=speedMoveCamera;
        }
        else
        {
            camera.y = 0;
        }
    }
    if (checkPressKey('KeyD')) 
    {
       if (camera.x+camera.width<map.x+map.width)
       {
           camera.x+=speedMoveCamera;   
       }
       else
       {
           camera.x = map.x + map.width - camera.width;
       }
    }
    if (checkPressKey('KeyS')) 
    {
       if (camera.y+camera.height<map.y+map.height)
       {
           camera.y+=speedMoveCamera;
       }
       else
       {
           camera.y = map.y + map.height - camera.height;
       }
    }
    if (checkPressKey('KeyA')) 
    {
    //    camera.x-=speedMoveCamera;
        if (camera.x>0) 
        {
            camera.x-=speedMoveCamera;
        }
        else
        {
            camera.x = 0;
        }
    }
}

var Bullets = function () { 
   

    this.bullet = {
        being:false,
        x:null,
        y:null,
        angle:null,
        dist: 0,
        DMG:null,
        master: null,
    }
    this.speed = 20; 
    this.bulletArr = [];
    this.drawBullets=function(context)
    {
        let countTrue = 0;
        for (let i = 0; i < this.bulletArr.length;i++)
        {
            if (this.bulletArr[i].being==true)
            {
                context.beginPath();
                context.fillStyle = "#FFFF00";
	            context.arc(this.bulletArr[i].x*scale-camera.x,this.bulletArr[i].y*scale-camera.y, 
                                        2*scale, 2*Math.PI, false);
	            context.fill();
	            context.lineWidth = 1;
	            context.strokeStyle = 'red';
	            context.stroke();
                countTrue++;
            }
        }
        //context.fillText(countTrue+'',20,50);
    }
}
var Burst=function()
{
    this.burstOne = {
        being: false,
        x: null,
        y: null,
        count: 0,
        maxCount: 15,
    }
    this.burstArr = [];
    this.draw=function()
    {
        for (let i = 0; i < this.burstArr.length;i++)
        {
            let burst = this.burstArr[i];
        
            if (burst.being==true)
            {
                context.strokeStyle = 'red';
                context.lineWidth = 1;
                context.beginPath();
                context.arc(burst.x*scale-camera.x,burst.y*scale-camera.y,
                                burst.count*scale, 0,3.14*2, false);
                context.stroke()
            }
        }

    }
}
var Bonuses = function () {
    this.quantityBonus = quantityBonus; //150;
    this.quantityBonusMin = 10;
    this.bonus = {
        being: false,
        x:null,
        y: null,
        width: 30,
        height: 30,
        type: 0,//null
        time: 0,
        //maxTime: 100,
    }
      
    this.timeNew = 3//250;
    this.countTimeNew = 0;
    this.bonusArr = [];
    this.draw = function () 
    {
        for (let i = 0; i < this.bonusArr.length;i++)
        {
            if (this.bonusArr[i].being==true)
            {
                let nameImage = null;
                switch(this.bonusArr[i].type)
                {
                    case 0: nameImage = 'patrons'; break;
                    case 1: nameImage = 'energy'; break;
                    case 2: nameImage = "HP"; break;
                }
                drawSprite(context,imageArr.get(nameImage),
                    this.bonusArr[i].x,this.bonusArr[i].y,camera,scale)

            }

        }
    }
}
function loadImageArr()// загрузить массив изображений
{
    // заполняем массив изображений именами
    for (let value of nameImageArr  )
    {
        let image=new Image();
        image.src="/static/img/"+value+".png";   
        imageArr.set(value,image);
    }
    // проверяем загружены ли все изображения
    for (let pair of imageArr  )
    {
             imageArr.get(pair[0]).onload = function() {
                   countLoadImage++;
                   //console.log(imageArr);
                   console.log(countLoadImage);
                   if (countLoadImage==imageArr.size) 
                   {
                       imageLoad=true;
                    //  console.log(imageArr);
                   } // если загруженны все ищображения
             }
             imageArr.get(pair[0]).onerror = function() {   
                   alert("во время загрузки произошла ошибка");
                   //alert(pair[0].name);
                   
             }
     }  
}
// функция отвечает за работы формы при старте до симмуляции.
function updateFormStart()
{
    // минимальные значеиие для input
    valueInputArr=[
        {num:2, value: 300},
        {num:3, value: 200},
        {num:4, value: 100},
        {num: 5, value: 1 },

    ]
  
    var clearButton = document.getElementById('clear');
    clearButton.addEventListener("click", clearStartWin,event)
    var range = document.getElementById('agressionMutate');
    var inputAgres = document.getElementById('valueAgression');
    var inputArr = document.querySelectorAll('#startForm input');

    setInterval(function () {
        inputAgres.value = range.value;
    },16);
    // заполняем подсказки с минимальными значениями
    for (let i = 0; i < inputArr.length; i++) 
    {
        for (let j = 0; j < valueInputArr.length; j++) 
        {
                if (i == valueInputArr[j].num)
                {
                    inputArr[i].nextElementSibling.innerHTML += valueInputArr[j].value;             
                }
        }            
    }
    // подсветить красным те значения которые меньши минимально допустимых
    setInterval(function () {
        for (let i = 0; i < inputArr.length; i++)
        {
            for (let j = 0; j < valueInputArr.length;j++)
            {
                    
                if (i==valueInputArr[j].num)
                if (Number(inputArr[i].value) < valueInputArr[j].value) 
                {
                    inputArr[i].style.color = "red";
                } 
                else
                {
                    inputArr[i].style.color = "black";
                }
            }
                
        }
    }, 16);
    // автоматически заполнить минимальыми значниями при смене фокуса
    for (let i = 0; i < inputArr.length; i++) 
    {
        inputArr[i].onblur = function (){
                           
            for (let j = 0; j < valueInputArr.length; j++) 
            {

                if (i == valueInputArr[j].num)
                if (Number(inputArr[i].value) < valueInputArr[j].value ||
                    inputArr[i].value == '') 
                {
                    inputArr[i].value = valueInputArr[j].value;
                }
            }

        }
    }
    //setInterval(function () {
    ;
    // запрет вводить все кроме уивр и нули в начале строки
    for (let i = 0; i < inputArr.length;i++)
    {

        //inputArr[i].oninput = e => 
        inputArr[i].oninput = function (e) {
            //if (inputArr[i].value == '0') inputArr[i].value = '';
                e.target.value = e.target.value.replace(/^0/, ''); 
                e.target.value = e.target.value.replace(/\D/g, '');
                if (inputArr[i].value.match("^0+")) {
                    inputArr[i].value = '';
                }
                  
        }
              
                
    }
        //}, 1);


    // функция сброса формы в стандартные значения
    function clearStartWin(event) 
    {
        event.preventDefault();
        domElemsArr = [];
        for (attr in opt)
        {
            domElem = document.getElementById(attr);
            domElemsArr.push(domElem);
        }
        console.log(domElemsArr[0].id);
        for (let i = 0; i < domElemsArr.length;i++)
        {
            for (attr in opt)
            {
                if (attr==domElemsArr[i].id)
                {
                    //domElemsArr[i].setAttribute('value', opt[attr]);
                    domElemsArr[i].value = opt[attr];
                }
            }
        }
    }
}
var file = null;
window.addEventListener('load', function () {
    loadImageArr();
    updateFormStart();
    var btnStart = document.getElementById('start');
    var startForm=document.getElementById('startForm');
    var btnContinue=document.getElementById('continue');
    formFile=document.getElementById('formFile');
    var btnLoad=document.getElementById('load');
    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");
    updateSize();
    bonuses = new Bonuses();
    bullets = new Bullets();
    burst = new Burst();
    initKeyboardAndMouse(['KeyA', 'KeyW', 'KeyS', 'KeyD',"NumpadSubtract",'NumpadAdd','Minus','Equal',
                        'Space','Digit1','Digit2','Digit3','Digit4','Digit5','KeyQ','KeyH','KeyP','KeyM',]);
    file = document.getElementById('your-files');
    // загрузить из файла
    file.addEventListener("change",function(){ 
        console.log(file);
        handleFiles();
        var interval = setInterval(function () {
            if (dataResultFile!=null)
            {

                startSimulation(2);
                console.log(dataResultFile);
                clearInterval(interval);
            }
        },100);
    });
    
    /*if (checkDataStorage()==false)
    {
        btnContinue.setAttribute('disabled','')
    }*/
    btnLoad.onclick=function(event)
    {
        event.preventDefault();
        formFile.style.display = 'block';
    }
    btnContinue.onclick = function (event) {
        event.preventDefault();
        startSimulation(1);
    }
   

    btnStart.onclick=function(event)
    {
        event.preventDefault();
        startForm.style.display = 'none';
        canvas.style.display = 'block';
        socket.emit('dataForGet', dataForGet);
      //  removeDataStorage();
        //calcParamSimulation();
       // startSimulation();
    }
});

 
/*  srand(2);*/
//updateSize();
window.onresize = function()
{
    updateSize()
}
function updateSize()
{
    windowWidth=document.documentElement.clientWidth;
    windowHeight=document.documentElement.clientHeight;
    let mult =1;
    if (windowWidth>=windowHeight)
    {
        canvasWidth = /*canvas.width = */windowHeight*screenWidth/screenHeight;
        canvasHeight = /*canvas.height = */windowHeight;
        if (canvasWidth>windowWidth)
        {
            mult = windowWidth/canvasWidth;
           // canvas.width =
                canvasWidth *= mult;
            //canvas.height =
                canvasHeight *= mult;
        }
        canvasWidthMore = true;
    }
    else
    {
        canvasWidthMore = false;
        canvasWidth = /*canvas.width*/  windowWidth;
        canvasHeight= /*canvas.height*/  windowWidth*screenHeight/screenWidth;
    }
    
    canvas.setAttribute('width',canvasWidth);
    canvas.setAttribute('height',canvasHeight);
    canvas.style.setProperty('left', (window.innerWidth - canvas.width)/2 + 'px'); 
    canvas.style.setProperty('top', (window.innerHeight - canvas.height) / 2 + 'px'); 
    if (canvasWidthMore==true)
    {
        context.scale(windowHeight / screenHeight * mult, windowHeight / screenHeight * mult);   
        mouseMultX = windowHeight / screenHeight * mult;
        mouseMultY = windowHeight / screenHeight * mult;
    }
    else
    {
       context.scale(windowWidth/screenWidth,windowWidth/screenWidth);
        mouseMultX = windowWidth / screenWidth;
        mouseMultY = windowWidth / screenWidth;
    }
    //setOffsetMousePosXY((window.innerWidth - canvas.width)/2,
    //                        (window.innerHeight - canvas.height)/2);
    //camera.width = canvasWidth;
    //camera.height = canvasHeight;
}
function drawAll() // нарисовать все
{
    context.fillStyle = 'black';
    context.fillRect(0, 0, screenWidth,screenHeight/*canvas.width, canvas.height*/);
    //context.save();
    // если не перемотка
    if (visible==true)
    {

        for (let i = 0; i < panzerArr.length;i++)
        {
            if (panzerArr[i].being==true)
            {
          /*      if (numPanzMaxXP==i)
                {
                    context.fillStyle = 'white';
                    context.fillRect(panzerArr[i].x*scale-3,panzerArr[i].y*scale-3,
                        panzerArr[i].width*scale+6,panzerArr[i].height*scale+6)
                    //drawPanzer(panzerArr[i],true);
                }*/
              
                if (numSelectPanzer==i)
                {
                    drawPanzer(panzerArr[i],true);

                }
                else
                {
                    drawPanzer(panzerArr[i]);
                }
                
            }
        }
        for (let i = 0; i < wallArr.length;i++)
        {
            drawWall(wallArr[i]);
        }
        bonuses.draw();
        bullets.drawBullets(context);
        burst.draw();
        context.fillStyle = 'red';
        context.fillText(Math.trunc(mouseX)+' '+Math.trunc(mouseY), 1,20);
        // рисуем полоски енергии и HP танков
        for (let i = 0; i < panzerArr.length;i++)
        {
            if (panzerArr[i].being==true)
            {

                let width = size;
                if (panzerArr[i].HP>0)
                {

                    context.fillStyle = "green";
                    context.fillRect(panzerArr[i].x*scale-camera.x-2*scale,
                            panzerArr[i].y*scale-camera.y-5*scale,
                            width*panzerArr[i].HP/panzerArr[i].maxHP*scale,4*scale);
                }
                if (panzerArr[i].energy>0)
                {
                    context.fillStyle = "blue";
                    context.fillRect(panzerArr[i].x*scale-camera.x-2*scale,
                                panzerArr[i].y*scale-camera.y-10*scale,
                                width*panzerArr[i].energy/panzerArr[i].maxEnergy*scale,4*scale);
                }
            }
        }
 /*       for (let i = 0; i < panzerArr.length;i++)
        {
            if (visibleEnemy(numSelectPanzer,i)==true &&
                panzerArr[numSelectPanzer].team!=panzerArr[i].team)
            {
                context.beginPath();
                context.strokeStyle = "green";
                context.lineWidth = 1;
                context.moveTo(panzerArr[numSelectPanzer].centerX*scale-camera.x,
                                panzerArr[numSelectPanzer].centerY*scale-camera.y);
                context.lineTo(panzerArr[i].centerX*scale-camera.x,panzerArr[i].centerY*scale-camera.y);
                context.stroke(); 
            }
        }*/
    
       /* for (let i = 0; i < helperArr.length;i++)
        {
            helperArr[i].draw();
        }*/
    }
    context.fillStyle = 'gray';
    context.fillRect(camera.width,1,widthSide,screenHeight);
    context.fillRect(1,camera.height,screenWidth,heightSide);
/*

    if (visible==true)
    {

        *//* DRAW GENES*//*
        genes.draw(context);
    }*/
    //genes.draw(context,1120,genes.commandArrTwo);

/*
    context.font='20px Arial';
    addY = 23;
    startY = 620;
    context.fillStyle = 'blue';
    context.fillText("numGeneration: "+numGeneration, 1,startY);

    context.fillStyle = 'red';
    context.fillText("Steps: "+countLoopIter, 1,startY+addY);
    
    context.fillStyle = 'blue';
    context.fillText("score Generation: "+scoreGeneration, 1,startY+addY*2);

    //context.font='25px Arial';
    context.fillStyle = 'blue';
    context.fillText("max Score generation: "+maxScore, 1,startY+addY*3);
   
    //context.font='25px Arial';
    context.fillStyle = 'green';
    context.fillText("Living panzer: "+countBeingPanzer, 1,startY+addY*4);

    //context.font='25px Arial';
    context.fillStyle = 'blue';
    context.fillText("max XP: "+maxXPPanzer, 1,startY+addY*5);*/
   
    /*рисуем уровень и параметры танка*/
    if (visible==true)
    {

        let numP = 0;
        if (modeGame=='HERO')
        {
            numP = numSelectPanzer;
        }
        else if (modeGame=='GOD')
        {
            numP = numGenesPanzer;
        }
       // levelNextXP = progresslevel[panzerArr[numP].level];
        context.font='25px Arial';
        context.fillStyle = 'white';
        /*context.fillText("Level: "+panzerArr[numP].level+" "
                    +"Evolutionary meat: "+panzerArr[numP].XP+" from: "+levelNextXP, 300,630);*/
       // context.fillText("Level: "+panzerArr[numP].level, 350,630);
        drawParamPanzer(350, 650, numP);
       // drawButton(buttonSave);

    }
    
   
    
}
function drawButton(obj,hower=false)// нарисовать кнопку
{
    context.fillStyle = obj.color;
    context.fillRect(obj.x, obj.y, obj.width, obj.height);
    if (hower==true)
    {
        context.strokeStyle = obj.colorHower;
        context.strokeRect(obj.x, obj.y, obj.width, obj.height);
    }
    context.fillStyle = obj.colorText;
    
    context.font = obj.fontSize+'px Arial';
    let widthText=context.measureText(obj.str).width;
    let x = obj.width/2 - widthText / 2;
    context.fillText(obj.str, obj.x+x, obj.y+obj.height/2+obj.fontSize/3/*+obj.fontSize*1.3*/);
   // this.heightOneItem/2+sizeFont/3
}
function drawWall(wall)// нарисовать стену
{
    context.fillStyle = wall.color;
    context.fillRect(wall.x*scale-camera.x, wall.y*scale-camera.y, 
                (wall.width+1)*scale, (wall.height+1)*scale);
}
function drawPanzer(panzer,select=false)// нарисовать танк
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
  
    context.translate(panzer.x*scale + panzer.width / 2*scale-camera.x, 
                panzer.y*scale + panzer.height / 2*scale-camera.y); // translate to rectangle center



    context.rotate((Math.PI / 180) * (panzer.angleBody+90)/*Math.trunc(panzer.angleBody/90)*90*/); // rotate

    context.translate(-(panzer.x*scale + panzer.width / 2*scale-camera.x),
                -(panzer.y*scale + panzer.height / 2*scale-camera.y)); // translate back

    context.lineWidth = 1;
    //рисуем тело танка
    context.strokeRect(panzer.x*scale-camera.x, panzer.y*scale-camera.y,
            panzer.width*multSide*scale, panzer.height*scale);
    let addX = panzer.width - panzer.width * multSide;
    context.strokeRect(panzer.x*scale-camera.x+addX*scale, panzer.y*scale-camera.y, 
            panzer.width*multSide*scale, panzer.height*scale);
    context.strokeRect(panzer.x*scale-camera.x+panzer.width*multSide*scale,
                    panzer.y*scale-camera.y+panzer.height*multSide*scale,
                    (panzer.width-panzer.width*multSide*2)*scale,
                    (panzer.height-panzer.height*multSide*2)*scale);

    // рисуем кружок башни
    context.beginPath();
    context.arc(panzer.x*scale-camera.x + panzer.width / 2*scale,
                panzer.y*scale-camera.y + panzer.height / 2*scale,
                panzer.sizeTower*scale, 0,3.14*2, false);
    context.stroke();

    context.restore();
    
    // рисуем пушку
    context.beginPath();
    context.lineWidth = 3;
    context.moveTo(panzer.towerX*scale-camera.x,panzer.towerY*scale-camera.y);
    context.lineTo(panzer.towerX1*scale-camera.x,panzer.towerY1*scale-camera.y);
    context.stroke();  
}
function drawSprite(context,image,x,y,camera,scale)// функция вывода спрайта на экран
{
    if(!context || !image) return;
    context.save();
    context.scale(scale,scale);
    context.drawImage(image,x/**scale*/-camera.x/scale,y/**scale*/-camera.y/scale);
    context.restore();
}
function drawParamPanzer(x,y,numP)// нарисовать параметры танка
{
    let count = 0;
    let addY = 20;
    for (param in maxParam)
    {
        context.font='15px Arial';
        context.fillStyle = 'black';
        context.fillText(param+'',x,y+count*addY+10);
        for (param2 in panzerArr[numP])
        {
            if (param==param2)
            {

                drawBarParam(x+100, y + count* addY, panzerArr[numP][param2], maxParam[param]);
            }
        }
        count++;
    }
}
function drawBarParam(x,y,value,max)// нарисовать один прогресс бар
{
    let width = 300;
    context.fillStyle = "red";
    context.fillRect(x, y, width, 10);
    context.fillStyle = "green";
    context.fillRect(x, y, width*value/max, 10);

}