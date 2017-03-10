"use strict";
var disp = $('.disp'),
    msg = $('.msg');

var disWidthInPixels = 40 ;
var gameRunning ;
var gameInterval , timeStep ,currTime,frameStep;
var BAD_MOVE = 1 , ACE_MOVE = 2 , GOOD_MOVE = 3 ;
var availablePixels ,currentCoin = [];

//在遊戲框中添加畫素(蛇的身體)
for (var i = 0; i < disWidthInPixels; i++ )
{
	for (var j = 0; j < disWidthInPixels ; j++)
	{
		//直接透過JS將class為pixel的div加在.disp裡面
		//另外綁上X Y,可以比較方便使用pixel
		var tmp = $('<div class = "pixel" data-x ="'+ j +'" data-y = "'+ i +'"></div>');
		disp.append(tmp);
	}
}	

//將文字顯示在.msg-a .msg-b的格子中	
var showMessage = function (ma,mb)
{
	msg.find('.msg-a').text(ma);
	msg.find('.msg-b').text(mb);
};

var useNextRandomPixelForCoin = function ()
{
	var ap = availablePixels ;
	if (ap.length === 0)
	{
		return false;
	}
	//Math.floor取最大整數而Math.random()*ap.length將隨機變數控制在長度範圍內
	var idx = Math.floor(Math.random()*ap.length);
	currentCoin = ap.splice(idx,1)[0].split('|');
    $('div.pixel[data-x="' + currentCoin[0] + '"][data-y="' + currentCoin[1] + '"]').addClass('taken');
	return true;

};
var releasePixel = function (x,y)
{
	$('div.pixel[data-x="' + x +'"][data-y="' + y +'"]').removeClass('taken');
	availablePixels.push( x + '|' + y);
};

var tryAllocatingPixel = function (x, y)
{
	var ap = availablePixels ;
	var p = x + '|' + y ;
	//透過indexof()尋找物件的索引值
	var idx =ap.indexOf(p);
	
	if (idx !== -1)
	{
		ap.splice(idx,1);
		//data-y打成datd-y所以才錯誤
		$('div.pixel[data-x="' + x + '"][data-y="' + y + '"]').addClass('taken');
		return true;
	}
	else
	{
		return false;
	}
};



var adjustSpeed = function (l)
{
	if (l > 500) 
	{
		frameStep = 50;
	}
	else if ( l > 400)
	{
		frameStep = 100 ;
	}
	else if ( l > 300)
	{
		frameStep = 150 ;
	}
	else if ( l > 200)
	{
		frameStep = 200 ;
	}
};

//防止打錯字
var DIR_DOWN = 'd',
	DIR_RIGHT = 'r',
	DIR_LEFT = 'l',
	DIR_UP = 'u';

var snake = {
	direction:'l',
	bodyPixels: [],
	move: function ()
	{
		var head = this.bodyPixels[this.bodyPixels.length - 1];
		//console(head);
		var nextHead = [];
		if (this.direction === DIR_LEFT)
		{
			nextHead.push(head[0] - 1);
		}
		else if (this.direction === DIR_RIGHT)
		{
			nextHead.push(head[0] + 1);
		}
		else
		{
			nextHead.push(head[0]);
		}
		//showMessage(nextHead,'');
		if (this.direction === DIR_UP)
		{
			nextHead.push(head[1] - 1);
		}
		else if (this.direction === DIR_DOWN)
		{
			nextHead.push(head[1] + 1);
		}
		else
		{
			nextHead.push(head[1]);
		}
		
		//showMessage(nextHead,currentCoin);
		if( nextHead[0] == currentCoin[0] && nextHead[1] == currentCoin[1])
		{
			
			this.bodyPixels.push(nextHead);
			adjustSpeed(this.bodyPixels.length);
			if (useNextRandomPixelForCoin())
			{
				return GOOD_MOVE;
			}
			else
			{
				//因為畫面中已無可用的畫素
				return ACE_MOVE;
			}
			
		}
		else if ( tryAllocatingPixel( nextHead[0] , nextHead[1]))
		{
			//沒有吃到東西，但是還是要將下一個畫素加進去蛇的身體
			
			//要去除尾巴
			var tail = this.bodyPixels.splice(0, 1)[0];
			//showMessage(this.bodyPixels.length,nextHead);
			this.bodyPixels.push(nextHead);
			releasePixel(tail[0],tail[1]);
			return GOOD_MOVE;
		}
		else
		{
			//showMessage('hi','');
			return BAD_MOVE ;
		}
	}
};

var initializeGame = function ()
{
	frameStep = 250 ;
	timeStep = 50 ;
	currTime = 0 ;
	//宣告儲存畫素的陣列
	availablePixels = [];
	for (var i = 0; i < disWidthInPixels; i++ )
	{
		for (var j = 0; j < disWidthInPixels ; j++)
		{
			availablePixels.push(i + '|' + j);
		}
	}
	
	//初始化蛇
	snake.direction = 'l';
	snake.bodyPixels = [];
	//迴圈範圍代表蛇的長度
	for (var i = 29 , end =29 - 16 ; i > end ; i--)
	{
		tryAllocatingPixel(i,25);
		snake.bodyPixels.push([i,25]);
	}
	
	useNextRandomPixelForCoin();
};

var startMainLoop = function ()
{
	//蛇行動之速度
	gameInterval = setInterval( function () {
		currTime += timeStep ;
		if (currTime >= frameStep)
		{
			
			//確認下一步可不可以行動
			var m = snake.move();
			if ( m === BAD_MOVE)
			{
				//showMessage('hi','');
				clearInterval(gameInterval);
				gameRunning = false ;
				showMessage('Game over','Press space to start again');
				
			}
			else if ( m === ACE_MOVE)
			{
				clearInterval(gameInterval);
				gameRunning = false ;
				showMessage('You win','Press space to start again');
			}
			currTime %= frameStep ;
		}
	},timeStep);
	showMessage(' ',' ');
};

//透過下列function得知按鍵配置的數值
$(window).keydown(function(e)
{
	//console.log(e.which);
	var k = e.which;
	
	//up
	if (k === 38)
	{
		e.preventDefault();
		if (snake.direction !== DIR_DOWN)
			snake.direction = DIR_UP;
	}
	//down
	else if (k === 40)
	{
		e.preventDefault();
		if (snake.direction !== DIR_UP)
			snake.direction = DIR_DOWN;
	}
	//left
	else if (k === 37)
	{
		e.preventDefault();
		if (snake.direction !== DIR_RIGHT)
			snake.direction = DIR_LEFT;
	}
	//right
	else if (k === 39)
	{
		e.preventDefault();
		if (snake.direction !== DIR_LEFT)
			snake.direction = DIR_RIGHT;
	}
	//space
	else if (k === 32)
	{
		e.preventDefault();
		if (!gameRunning)
		{
			initializeGame();
			startMainLoop();
			gameRunning = true ;
		}
	}
	//p 暫停
	else if (k === 80)
	{
		e.preventDefault();
		//遊戲進行中P鍵才有功能
		if (gameRunning)
		{
			if (!gameInterval)
			{
				startMainLoop();
			}else{
				clearInterval (gameInterval);
				gameInterval = null ;
				showMessage('Pause','');
				
			}
		}
	}
	//f,turn left
	else if (k === 70)
	{
		e.preventDefault();
		if (snake.direction === DIR_DOWN)
			snake.direction = DIR_RIGHT;
		else if (snake.direction === DIR_RIGHT)
					snake.direction = DIR_UP;
		else if (snake.direction === DIR_LEFT)
					snake.direction = DIR_DOWN;
		else if (snake.direction === DIR_UP)
					snake.direction = DIR_LEFT;		
	}
	//j,turn right
	else if (k === 74)
	{
		e.preventDefault();
		if (snake.direction === DIR_RIGHT)
			snake.direction = DIR_DOWN;
		else if (snake.direction === DIR_UP)
					snake.direction = DIR_RIGHT;
		else if (snake.direction === DIR_DOWN)
					snake.direction = DIR_LEFT;
		else if (snake.direction === DIR_LEFT)
					snake.direction = DIR_UP;	
	}
});

showMessage('Snake','Press space to start');