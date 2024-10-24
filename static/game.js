
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
var scale = 1;

var dataForGet = {
    wallArr:['x','y'],
    burstArr:['x','y','count'],
    bulletArr:['x','y'],
    panzerArr:['x','y','color','angleBody','angleTower'],
    bonusArr:["x",'y','type']
}
var socket = io();
socket.on('message', function(data) {
    console.log(data);
});
socket.on('dataDraw', function (data) {
    console.log(data);
});
function loadImageArr()// ��������� ������ �����������
{
    // ��������� ������ ����������� �������
    for (let value of nameImageArr  )
    {
        let image=new Image();
        image.src="img/"+value+".png";   
        imageArr.set(value,image);
    }
    // ��������� ��������� �� ��� �����������
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
                   } // ���� ���������� ��� �����������
             }
             imageArr.get(pair[0]).onerror = function() {   
                   alert("�� ����� �������� ��������� ������");
                   //alert(pair[0].name);
                   
             }
     }  
}
// ������� �������� �� ������ ����� ��� ������ �� ����������.
function updateFormStart()
{
    // ����������� �������� ��� input
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
    // ��������� ��������� � ������������ ����������
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
    // ���������� ������� �� �������� ������� ������ ���������� ����������
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
    // ������������� ��������� ����������� ��������� ��� ����� ������
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
    // ������ ������� ��� ����� ���� � ���� � ������ ������
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


    // ������� ������ ����� � ����������� ��������
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
    updateFormStart();
    var btnStart = document.getElementById('start');
    var startForm=document.getElementById('startForm');
    var btnContinue=document.getElementById('continue');
    formFile=document.getElementById('formFile');
    var btnLoad=document.getElementById('load');
    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");
    updateSize();
    initKeyboardAndMouse(['KeyA', 'KeyW', 'KeyS', 'KeyD',"NumpadSubtract",'NumpadAdd','Minus','Equal',
                        'Space','Digit1','Digit2','Digit3','Digit4','Digit5','KeyQ','KeyH','KeyP','KeyM',]);
    file = document.getElementById('your-files');
    // ��������� �� �����
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
function drawAll() // ���������� ���
{
    context.fillStyle = 'black';
    context.fillRect(0, 0, screenWidth,screenHeight/*canvas.width, canvas.height*/);
    //context.save();
    // ���� �� ���������
    if (visible==true)
    {

        for (let i = 0; i < panzerArr.length;i++)
        {
            if (panzerArr[i].being==true)
            {
                if (numPanzMaxXP==i)
                {
                    context.fillStyle = 'white';
                    context.fillRect(panzerArr[i].x*scale-3,panzerArr[i].y*scale-3,
                        panzerArr[i].width*scale+6,panzerArr[i].height*scale+6)
                    //drawPanzer(panzerArr[i],true);
                }
              
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
        for (let i = 0; i < quantityWall;i++)
        {
            drawWall(wallArr[i]);
        }
        bonuses.draw();
        bullets.drawBullets(context);
        burst.draw();
        context.fillStyle = 'red';
        context.fillText(Math.trunc(mouseX)+' '+Math.trunc(mouseY), 1,20);
        // ������ ������� ������� � HP ������
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
        for (let i = 0; i < panzerArr.length;i++)
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
        }
    
       /* for (let i = 0; i < helperArr.length;i++)
        {
            helperArr[i].draw();
        }*/
    }
    context.fillStyle = 'gray';
    context.fillRect(camera.width,1,widthSide,screenHeight);
    context.fillRect(1,camera.height,screenWidth,heightSide);


    if (visible==true)
    {

        /* DRAW GENES*/
        genes.draw(context);
    }
    //genes.draw(context,1120,genes.commandArrTwo);


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
    context.fillText("max XP: "+maxXPPanzer, 1,startY+addY*5);
   
    /*������ ������� � ��������� �����*/
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
        levelNextXP = progresslevel[panzerArr[numP].level];
        context.font='25px Arial';
        context.fillStyle = 'white';
        /*context.fillText("Level: "+panzerArr[numP].level+" "
                    +"Evolutionary meat: "+panzerArr[numP].XP+" from: "+levelNextXP, 300,630);*/
        context.fillText("Level: "+panzerArr[numP].level, 350,630);
        drawParamPanzer(350, 650, numP);
        drawButton(buttonSave);

    }
    
   
    
}
function drawButton(obj,hower=false)// ���������� ������
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
function drawWall(wall)// ���������� �����
{
    context.fillStyle = wall.color;
    context.fillRect(wall.x*scale-camera.x, wall.y*scale-camera.y, 
                (wall.width+1)*scale, (wall.height+1)*scale);
}
function drawPanzer(panzer,select=false)// ���������� ����
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
    
    // ������� ���� �����
    context.save();
  
    context.translate(panzer.x*scale + panzer.width / 2*scale-camera.x, 
                panzer.y*scale + panzer.height / 2*scale-camera.y); // translate to rectangle center



    context.rotate((Math.PI / 180) * (panzer.angleBody+90)/*Math.trunc(panzer.angleBody/90)*90*/); // rotate

    context.translate(-(panzer.x*scale + panzer.width / 2*scale-camera.x),
                -(panzer.y*scale + panzer.height / 2*scale-camera.y)); // translate back

    context.lineWidth = 1;
    //������ ���� �����
    context.strokeRect(panzer.x*scale-camera.x, panzer.y*scale-camera.y,
            panzer.width*multSide*scale, panzer.height*scale);
    let addX = panzer.width - panzer.width * multSide;
    context.strokeRect(panzer.x*scale-camera.x+addX*scale, panzer.y*scale-camera.y, 
            panzer.width*multSide*scale, panzer.height*scale);
    context.strokeRect(panzer.x*scale-camera.x+panzer.width*multSide*scale,
                    panzer.y*scale-camera.y+panzer.height*multSide*scale,
                    (panzer.width-panzer.width*multSide*2)*scale,
                    (panzer.height-panzer.height*multSide*2)*scale);

    // ������ ������ �����
    context.beginPath();
    context.arc(panzer.x*scale-camera.x + panzer.width / 2*scale,
                panzer.y*scale-camera.y + panzer.height / 2*scale,
                panzer.sizeTower*scale, 0,3.14*2, false);
    context.stroke();

    context.restore();
    
    // ������ �����
    context.beginPath();
    context.lineWidth = 3;
    context.moveTo(panzer.towerX*scale-camera.x,panzer.towerY*scale-camera.y);
    context.lineTo(panzer.towerX1*scale-camera.x,panzer.towerY1*scale-camera.y);
    context.stroke();  
}
function drawSprite(context,image,x,y,camera,scale)// ������� ������ ������� �� �����
{
    if(!context || !image) return;
    context.save();
    context.scale(scale,scale);
    context.drawImage(image,x/**scale*/-camera.x/scale,y/**scale*/-camera.y/scale);
    context.restore();
}
function drawParamPanzer(x,y,numP)// ���������� ��������� �����
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
function drawBarParam(x,y,value,max)// ���������� ���� �������� ���
{
    let width = 300;
    context.fillStyle = "red";
    context.fillRect(x, y, width, 10);
    context.fillStyle = "green";
    context.fillRect(x, y, width*value/max, 10);

}