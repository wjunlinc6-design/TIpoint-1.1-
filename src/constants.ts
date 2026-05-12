export const AVATAR_OPTIONS = [
  'https://cdn-icons-png.flaticon.com/256/4359/4359609.png',
  'https://cdn-icons-png.flaticon.com/256/4359/4359689.png',
  'https://cdn-icons-png.flaticon.com/256/4359/4359747.png',
  'https://cdn-icons-png.flaticon.com/256/4359/4359852.png',
  'https://cdn-icons-png.flaticon.com/256/4359/4359767.png',
  'https://cdn-icons-png.flaticon.com/256/4359/4359947.png'
];

export const SCENE_OPTIONS = [
  { name: '湖边', url: 'https://cdn.pixabay.com/photo/2022/09/25/15/58/waterfall-7478709_1280.jpg' },
  { name: '牧场', url: 'https://cdn.pixabay.com/photo/2025/05/06/12/19/hut-9582608_1280.jpg' },
  { name: '草坪', url: 'https://cdn.pixabay.com/photo/2025/11/10/10/01/landscape-9947733_960_720.jpg' },
  { name: '丛林', url: 'https://cdn.pixabay.com/photo/2023/11/01/01/50/autumn-8356402_960_720.jpg' }
];

export const WILDERNESS_URL = 'https://cdn.pixabay.com/photo/2021/07/19/22/07/mountains-6479150_960_720.jpg';

export const TREE_BIRTH_IMG = 'https://cdn-icons-png.flaticon.com/256/10540/10540718.png';
export const MAIN_TREE_IMG = 'https://cdn-icons-png.flaticon.com/256/6964/6964946.png';

const NAME_PREFIXES = ['发呆的', '打盹的', '光合作用的', '追蝴蝶的', '喝露水的', '晒太阳的', '慢悠悠的', '努力生长的', '充满希望的', '奇奇怪怪的'];
const NAME_NOUNS = ['考拉', '树懒', '小蘑菇', '蒲公英', '云朵精灵', '郁金香', '小松果', '蓝莓酱', '向日葵', '仙人掌'];

export function generateRandomName() {
  const prefix = NAME_PREFIXES[Math.floor(Math.random() * NAME_PREFIXES.length)];
  const noun = NAME_NOUNS[Math.floor(Math.random() * NAME_NOUNS.length)];
  return `${prefix}${noun}`;
}
