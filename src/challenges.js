// Original real-world awareness challenges. count = how many things to log; mins = lock time.
export const CHALLENGES = [
  { id: 'red5', sense: 'Sight', emoji: '🔴', title: 'Five Red Things', prompt: 'Walk outside and spot five red things you would normally walk past.', count: 5, mins: 10 },
  { id: 'sound3', sense: 'Sound', emoji: '👂', title: 'Three Sounds', prompt: 'Stand still for a minute. Name three separate sounds you can hear.', count: 3, mins: 5 },
  { id: 'never', sense: 'Sight', emoji: '🔍', title: 'Never Noticed', prompt: 'Find two things on your street you have never noticed before.', count: 2, mins: 10 },
  { id: 'smell', sense: 'Smell', emoji: '🌿', title: 'Follow Your Nose', prompt: 'Notice three different smells around you today.', count: 3, mins: 10 },
  { id: 'texture', sense: 'Touch', emoji: '🪨', title: 'Texture Hunt', prompt: 'Touch four different textures: rough, smooth, soft and cold.', count: 4, mins: 8 },
  { id: 'sky', sense: 'Sight', emoji: '☁️', title: 'Read the Sky', prompt: 'Look up. Describe three things about the sky right now.', count: 3, mins: 5 },
  { id: 'birds', sense: 'Nature', emoji: '🐦', title: 'Wild Neighbours', prompt: 'Spot three living creatures that are not people or pets.', count: 3, mins: 15 },
  { id: 'faces', sense: 'People', emoji: '🙂', title: 'Small Kindness', prompt: 'Notice three small acts of kindness or friendliness between people.', count: 3, mins: 15 },
  { id: 'circles', sense: 'Shape', emoji: '⭕', title: 'Circle Spotter', prompt: 'Find five circles hiding in the world around you.', count: 5, mins: 10 },
  { id: 'letters', sense: 'Sight', emoji: '🔤', title: 'Street Alphabet', prompt: 'Find the letters A, B, C and D on signs, in order.', count: 4, mins: 10 },
  { id: 'light', sense: 'Light', emoji: '🌤️', title: 'Light & Shadow', prompt: 'Notice three interesting shadows or reflections.', count: 3, mins: 8 },
  { id: 'quiet', sense: 'Sound', emoji: '🤫', title: 'The Quietest Sound', prompt: 'Find the two quietest sounds you can hear.', count: 2, mins: 5 },
  { id: 'green', sense: 'Nature', emoji: '🍃', title: 'Shades of Green', prompt: 'Spot four different shades of green.', count: 4, mins: 10 },
  { id: 'up', sense: 'Sight', emoji: '🏢', title: 'Above Eye Level', prompt: 'Look above eye level. Note three details up high.', count: 3, mins: 8 },
  { id: 'taste', sense: 'Taste', emoji: '🍵', title: 'Slow Sip', prompt: 'Eat or drink something slowly. Name three flavours or sensations.', count: 3, mins: 5 },
  { id: 'move', sense: 'Motion', emoji: '🌊', title: 'Things in Motion', prompt: 'Spot four things moving that are not cars or people.', count: 4, mins: 10 },
  { id: 'colour', sense: 'Sight', emoji: '🌈', title: 'Rainbow Walk', prompt: 'Find something red, orange, yellow, green and blue.', count: 5, mins: 15 },
  { id: 'body', sense: 'Body', emoji: '🫁', title: 'Check In', prompt: 'Notice three feelings in your body: temperature, tension, breath.', count: 3, mins: 3 },
];
export const SENSE_COLORS = { Sight: '#ff8a5b', Sound: '#7c9cff', Smell: '#5fd39a', Touch: '#e8b84a', Nature: '#4fd1a5', People: '#ff7aa8', Shape: '#ffb347', Light: '#ffd166', Taste: '#c792ea', Motion: '#2dd4bf', Body: '#f78c6c' };
export function dayKey(d = new Date()) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
export function dailyChallenge(key = dayKey()) {
  let h = 0; for (const c of key) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return CHALLENGES[h % CHALLENGES.length];
}
