
function crossLinePlayer(P1,P2)
{
    for (var attr in players)
    {
        for (let j = 0; j < players[attr].lineArr.length;j++)
        {
            if (players[attr].being==true)
            {
                let line = players[attr].lineArr[j];
                //let panz1 = panzerArr[numPanz1];
                //let panz2 = panzerArr[numPanz2];
                if (line.numP!=P1.id && line.numP!=P2.id)
                {
                    if (IsCrossing(P1.x,P1.y,P2.x, P2.y,line.x,line.y,line.x1,line.y1)==true)
                    {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}
function crossingTwoPoint(x1,y1,x2,y2,wallArr)// провер€ет могут ли 2 точки соединитьс€ по пр€мой без преп€тсвий стен
{
    for (let i = 0; i < wallArr.length;i++)
    {
        if (wallArr[i].type==0)
        {
          //alert(55);
            for (let j = 0; j < wallArr[i].lineArr.length;j++)
            {
            
                let line = wallArr[i].lineArr[j];
                if (IsCrossing(x1, y1, x2, y2,line.x,line.y,line.x1,line.y1)==true)
                {
                    return true;
                }
            }

        }
    }
    return false;
}
function   IsCrossing( x1,  y1,  x2,  y2,  x3,  y3,  x4,  y4)// функци€ расчета пересечни€ двух пр€мых
{
    var a_dx = x2 - x1;
    var a_dy = y2 - y1;
    var b_dx = x4 - x3;
    var b_dy = y4 - y3;
    var s = (-a_dy * (x1 - x3) + a_dx * (y1 - y3)) / (-b_dx * a_dy + a_dx * b_dy);
    var t = (+b_dx * (y1 - y3) - b_dy * (x1 - x3)) / (-b_dx * a_dy + a_dx * b_dy);
    return (s >= 0 && s <= 1 && t >= 0 && t <= 1);
}
function calcLineArr(objOrigin,type="wall",numP=null)// расчитать массив линий дл€ обьекта
{
   let lineArr=[];
   let obj=JSON.parse(JSON.stringify(objOrigin))
   if (type=='Player')
   {
       obj.x = obj.x - radius ;//Math.trunc(obj.x / mapSize) * mapSize;
       obj.y = obj.y - radius ;//Math.trunc(obj.y / mapSize) * mapSize;
       obj.width = radius * 2;
       obj.height = radius * 2;
   }
   for (let j=0;j<4;j++)
    {
        lineArr[j]=JSON.parse(JSON.stringify(line));//clone(line);
            
        if (j==0) lineArr[j]={
            x:obj.x,
            y:obj.y,
            x1:obj.x+obj.width,
            y1:obj.y,
        }
        if (j==1) lineArr[j]={
            x:obj.x+obj.width,
            y:obj.y,
            x1:obj.x+obj.width,
            y1:obj.y+obj.height,
        }
        if (j==2) lineArr[j]={
            x:obj.x+obj.width,
            y:obj.y+obj.height,
            x1:obj.x,
            y1:obj.y+obj.height,
        }
        if (j==3) lineArr[j]={
            x:obj.x,
            y:obj.y+obj.height,
            x1:obj.x,
            y1:obj.y,
        }
       if (type!='wall') 
       {
           lineArr[j].numP = numP;
       }
        ////console.log(wallArr[i].lineArr[j].x);      
    }
    return lineArr;
}