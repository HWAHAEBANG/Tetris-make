import BLOCKS from "./blocks.js"

// DOM
const playground = document.querySelector('.playground > ul');

// Setting
const GAME_ROWS = 20;
const GAME_COLS = 10;


// variables
let score = 0;
let duration = 500;
let downInterval;
let tempMovingItem;


const movingItem = {
  type: "tree",
  direction: 0,
  top: 0,
  left: 3
};

init();

// functions
function init() {
  tempMovingItem = {
    ...movingItem
  }; //  sallow copy가 되기때문에 이렇게 스프레드 오퍼레이터 해주지 않으면 오브젝트 heap값이 바뀌어버림
  // 이렇게 하면 오브젝트 전체가 아니라 값만 가져올 수 있음.
  for (let i = 0; i < GAME_ROWS; i++) {
    prependNewLine()
  }
  renderBlocks()
}

function prependNewLine() {
  const li = document.createElement('li');
  const ul = document.createElement('ul');

  for (let j = 0; j < GAME_COLS; j++) {
    const matrix = document.createElement('li');
    ul.prepend(matrix)
  }
  li.prepend(ul)
  playground.prepend(li)
}

function renderBlocks(moveType="" /* movetype을 보내는 moveBlock함수 외에 초기값을 "" 씀 */) {
  const {type, direction, top, left} = tempMovingItem; // 디스트럭쳐링
  const movingBlocks = document.querySelectorAll(".moving");

  movingBlocks.forEach(moving => {
    //console.log(moving);
    moving.classList.remove(type, "moving")
  })

  BLOCKS[type][direction].some(block => { //forEach는 마지막에 return true 한다고 해서 break시킬 수 없기떄문에, some을 사용하여, 완전히 다 끝내고 다시 시작하는게 효율적임
    const x = block[0] + left; //block의 첫번쨰값
    const y = block[1] + top; //block의 두번쨰값  
    //console.log({playground});
    const target = playground.childNodes[y] ? playground.childNodes[y].childNodes[0].childNodes[x] : null;
    const isAvailable = checkEmpty(target);
    if (isAvailable) {
      target.classList.add(type, 'moving') // 클래스를 type뿐만 아니라 moving도 같이주기 
    } else { // 잘못된 방향(넘침)으로 갈 경우 movingItem을 다시 넣고 다시 렌더링 돌려주는 역할을 함
      tempMovingItem = {
        ...movingItem 
      } // 원상복구\
      //renderBlocks(); // 다시실행(재귀함수)
      /** 재귀함수를 사용할 떄는 조심해야 하는게 콜스택 ,맥시멈, 액시드 같은 에러가 발생할 수있음
       * 그걸 방지하기위해 재귀함수를 이벤트루프안에 넣지 말고 웹으로 빼놨다가(테스크 큐에 넣어놨다가) 다시 실행할 수 있도록
       * setTimeout으로 밖같으로 잠시 빼놓는다.  
       * 그러면 이벤트 루프에 예약된 이벤트들이 다 실행이된 후에 스택에 다시 집어넣기 때문에 0초를 부여해도, 
       * 이벤트 스택이 넘치는 것을 방지할 수 있음!!*/
      setTimeout(() => {
        renderBlocks();
        if (moveType === 'top') { // 아래로 넘치는 것을 방지하기 위한 코드
          seizeBlock();
        }
      }, 0);
      return true; // 반복을 some을 사용했기 때문에 이렇게 원하는 시점에 중지를 시킬 수 있는 것임
    }
  });
  movingItem.left = left; // 위의 내용이 정상적으로 작동되면, 그제서야 무빙아이템을 업데이트 시켜주는 역할
  movingItem.top = top;
  movingItem.direction = direction;
}

function seizeBlock() { // 아주 중요한 역할. 끝까지 가서 내려갈 곳이 없으면 1. 색깔 유지  2. moving이라는 클래스를 다 뗀 후에  3.새로운 블럭을 만들것.
  const movingBlocks = document.querySelectorAll(".moving");

  movingBlocks.forEach(moving => {
    moving.classList.remove("moving");
    moving.classList.add('seized');
  })
  generateNewBlock();
}

function generateNewBlock(){
  movingItem.top = 0;
  movingItem.left = 3;
  movingItem.direction = 0;
  tempMovingItem = {...movingItem};
  renderBlocks();
}

function checkEmpty(target) {
  if (!target || target.classList.contains('seized')) {
    return false;
  }
  return true;
}

function moveBlock(moveType, amount) {
  tempMovingItem[moveType] += amount;
  renderBlocks(moveType)
}

function chageDirection() {
  const direction = tempMovingItem.direction;
  direction === 3 ? tempMovingItem.direction = 0 : tempMovingItem.direction += 1; // 왜 4가 아니고 3이지..? 4하면 네번쨰에서 사라짐.. 
  renderBlocks();
  // tempMovingIt em.direction += 1;
  // if(tempMovingItem.diretion === 4){
  //   tempMovingItem.direction = 0;
  // }
}

// event handling 
document.addEventListener('keydown', e => {
  switch (e.keyCode) {
    case 39:
      moveBlock('left', 1);
      break;
    case 37:
      moveBlock('left', -1);
      break;
    case 40:
      moveBlock('top', 1);
      break;
    case 38:
      chageDirection();
      break;
    default:
      break;
  }
  // console.log( e);
})