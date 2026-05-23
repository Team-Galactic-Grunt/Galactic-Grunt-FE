// pp.js

// pp.js의 최상단 데이터 부분만 덮어씌워 주세요

const pockets = [
  { id: "items", name: "도구", img: "../assets/images/bag_images/item_icon.png" },
  { id: "medicine", name: "회복약", img: "../assets/images/bag_images/heal_icon.png" },
  { id: "pokeballs", name: "몬스터볼", img: "../assets/images/bag_images/ball_icon.png" },
//   { id: "tmhm", name: "기술머신", img: "../assets/images/bag_images/disc_icon.png" },
  { id: "berries", name: "나무열매", img: "../assets/images/bag_images/fruit_icon.png" },
  { id: "keyitems", name: "중요한물건", img: "../assets/images/bag_images/important_icon.png" }
];

const inventoryData = {
  items: [
    { name: "금강옥", count: 1, icon: "../assets/images/bag_images/adamant_orb.png", desc: "디아루가에게 지니게 하면 드래곤과 강철 타입 기술의 위력이 올라간다." },
    { name: "백옥", count: 1, icon: "../assets/images/bag_images/lustrous_orb.png", desc: "펄기아에게 지니게 하면 드래곤과 물 타입 기술의 위력이 올라간다." },
    { name: "백금옥", count: 1, icon: "../assets/images/bag_images/griseous_orb.png", desc: "기라티나에게 지니게 하면 드래곤과 고스트 타입 기술의 위력이 올라가며, 오리진폼으로 변한다." }
  ],
  medicine: [
    { name: "고급상처약", count: 15, icon: "../assets/images/bag_images/hyper_potion.png", desc: "포켓몬 1마리의 HP를 200 회복한다." },
    { name: "기력의덩어리", count: 2, icon: "../assets/images/bag_images/max_revive.png", desc: "기절한 포켓몬 1마리를 HP가 모두 회복된 상태로 살린다." }
  ],
  pokeballs: [
    { name: "몬스터볼", count: 20, icon: "../assets/images/bag_images/monsterball.png", desc: "야생 포켓몬에게 던져서 잡기 위한 볼. 캡슐식으로 되어 있다." },
    { name: "수퍼볼", count: 10, icon: "../assets/images/bag_images/superball.png", desc: "몬스터볼보다 포획률이 높은 좋은 볼." },
    { name: "하이퍼볼", count: 5, icon: "../assets/images/bag_images/hyperball.png", desc: "수퍼볼보다 포획률이 높은 매우 좋은 볼." }
  ],
  tmhm: [],
  berries: [
    { name: "오렌열매", count: 12, icon: "../assets/images/bag_images/oran_berry.png", desc: "포켓몬에게 지니게 하거나 사용하면 HP를 10 회복한다." },
    { name: "시몬열매", count: 5, icon: "../assets/images/bag_images/presim_berry.png", desc: "포켓몬에게 지니게 하거나 사용하면 혼란 상태를 회복한다." },
    { name: "자뭉열매", count: 8, icon: "../assets/images/bag_images/sitrus_berry.png", desc: "포켓몬에게 지니게 하거나 사용하면 HP를 조금 회복한다." }
  ],
  keyitems: [
    { name: "천계의피리", count: 1, icon: "../assets/images/bag_images/azure_flute.png", desc: "천공에 울려 퍼지는 음색을 낸다는 피리. 누가 만들었는지 알 수 없다." }
  ]
};

// 이 아래의 const pocketIconsContainer... 부터 시작하는 모든 로직은 기존과 100% 동일하게 유지합니다.

const pocketIconsContainer = document.getElementById("pocket-icons");
const pocketName = document.getElementById("pocket-name");
const itemListContainer = document.getElementById("item-list");
const descIcon = document.getElementById("desc-icon");
const descText = document.getElementById("desc-text");

// 무한 스크롤 세팅
const REPEAT_SETS = 100; // 6개의 아이콘 세트를 100번 복사해서 가로로 길게 연결
const POCKETS_LEN = pockets.length;
// 양쪽으로 아무리 움직여도 끝에 닿지 않도록 100세트의 한가운데(300번째)에서 시작합니다.
let currentGlobalIndex = Math.floor(REPEAT_SETS / 2) * POCKETS_LEN; 
let currentItemIndex = 0;

// 진짜 카테고리 인덱스(0~5)를 계산해주는 함수 (음수가 되어도 에러가 나지 않음)
const getRealIndex = (index) => ((index % POCKETS_LEN) + POCKETS_LEN) % POCKETS_LEN;

// 화면에 아이콘 100세트(총 600개) 렌더링
for (let i = 0; i < REPEAT_SETS; i++) {
  pockets.forEach((pocket) => {
    const img = document.createElement("img");
    img.className = "p-icon";
    img.src = pocket.img;
    img.alt = pocket.name;
    pocketIconsContainer.appendChild(img);
  });
}
const pocketIconElements = document.querySelectorAll(".p-icon");

const updateUI = () => {
  // 현재 글로벌 인덱스를 진짜 카테고리 인덱스로 변환
  const realIndex = getRealIndex(currentGlobalIndex);
  const currentPocket = pockets[realIndex];

  pocketName.innerText = currentPocket.name;

  // 600개의 아이콘 중 현재 선택된 딱 하나의 아이콘만 확대
  pocketIconElements.forEach((el, idx) => {
    el.classList.toggle("active", idx === currentGlobalIndex);
  });

  // 슬롯머신 이동 (가운데 정렬 유지)
  const iconWidth = 34; 
  const viewportWidth = 120; 
  const translateX = (viewportWidth / 2) - (iconWidth / 2) - (currentGlobalIndex * iconWidth);
  
  pocketIconsContainer.style.transform = `translateX(${translateX}px)`;


  const items = inventoryData[currentPocket.id];

  itemListContainer.innerHTML = "";
  

  // 비어있는 가방 카테고리
  // if (items.length === 0) {
  //   itemListContainer.innerHTML = `<div style="padding:10px; color:#555; font-weight:bold;">도구가 없습니다.</div>`;
  //   descIcon.innerHTML = "❌";
  //   descText.innerText = "이 주머니는 비어있습니다.";
  //   return;
  // }

  items.forEach((item, idx) => {
    const row = document.createElement("div");
    row.className = `item-row ${idx === currentItemIndex ? "focused" : ""}`;
    row.innerHTML = `<span>${item.name}</span> <span>x ${item.count}</span>`;
    itemListContainer.appendChild(row);
    
    if (idx === currentItemIndex) {
      row.scrollIntoView({ block: "nearest" });
    }
  });

  descIcon.innerHTML = `<img src="${items[currentItemIndex].icon}" alt="item-icon" style="width: 32px; height: 32px; object-fit: contain; margin-bottom: 4px;">`;
  descText.innerText = items[currentItemIndex].desc;
};

updateUI();

document.addEventListener("keydown", (e) => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
    e.preventDefault();
  }

  const realIndex = getRealIndex(currentGlobalIndex);
  const itemsCount = inventoryData[pockets[realIndex].id].length;

  if (e.key === "ArrowRight") {
    // 오른쪽 화살표: 한계 없이 계속 증가 (무한 스크롤)
    currentGlobalIndex++; 
    currentItemIndex = 0; 
  } 
  else if (e.key === "ArrowLeft") {
    // 왼쪽 화살표: 한계 없이 계속 감소 (무한 스크롤)
    currentGlobalIndex--; 
    currentItemIndex = 0;
  } 
  else if (e.key === "ArrowDown" && itemsCount > 0) {
    currentItemIndex = Math.min(currentItemIndex + 1, itemsCount - 1);
  } 
  else if (e.key === "ArrowUp" && itemsCount > 0) {
    currentItemIndex = Math.max(currentItemIndex - 1, 0);
  }

  updateUI();
});