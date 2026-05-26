import hyperPotionIcon from '../assets/images/bag_images/hyper_potion.png';
import maxReviveIcon from '../assets/images/bag_images/max_revive.png';
import monsterBallIcon from '../assets/images/bag_images/monsterball.png';
import superBallIcon from '../assets/images/bag_images/superball.png';
import hyperBallIcon from '../assets/images/bag_images/hyperball.png';
import oranBerryIcon from '../assets/images/bag_images/oran_berry.png';
import presimBerryIcon from '../assets/images/bag_images/presim_berry.png';
import sitrusBerryIcon from '../assets/images/bag_images/sitrus_berry.png';
import azureFluteIcon from '../assets/images/bag_images/azure_flute.png';
import adamantOrbIcon from '../assets/images/bag_images/adamant_orb.png';
import lustrousOrbIcon from '../assets/images/bag_images/lustrous_orb.png';
import griseousOrbIcon from '../assets/images/bag_images/griseous_orb.png';

export const BAG_SECTIONS = [
  { id: 'medicine', label: 'Medicine' },
  { id: 'pokeballs', label: 'Pokeballs' },
  { id: 'berries', label: 'Berries' },
  { id: 'keyitems', label: 'Key Items' },
];

export const DEFAULT_BAG = {
  medicine: [
    {
      id: 'hyper_potion',
      name: 'Hyper Potion',
      count: 15,
      icon: hyperPotionIcon,
      desc: 'Restores a large amount of HP.',
    },
    {
      id: 'max_revive',
      name: 'Max Revive',
      count: 2,
      icon: maxReviveIcon,
      desc: 'Fully restores a fainted Pokemon.',
    },
  ],
  pokeballs: [
    {
      id: 'monster_ball',
      name: 'Poke Ball',
      count: 20,
      icon: monsterBallIcon,
      desc: 'A device for catching wild Pokemon.',
    },
    {
      id: 'super_ball',
      name: 'Great Ball',
      count: 10,
      icon: superBallIcon,
      desc: 'A good, high-performance Ball.',
    },
    {
      id: 'hyper_ball',
      name: 'Ultra Ball',
      count: 5,
      icon: hyperBallIcon,
      desc: 'A better Ball with a higher catch rate.',
    },
  ],
  berries: [
    {
      id: 'oran_berry',
      name: 'Oran Berry',
      count: 12,
      icon: oranBerryIcon,
      desc: 'Restores a little HP.',
    },
    {
      id: 'presim_berry',
      name: 'Persim Berry',
      count: 5,
      icon: presimBerryIcon,
      desc: 'Heals confusion.',
    },
    {
      id: 'sitrus_berry',
      name: 'Sitrus Berry',
      count: 8,
      icon: sitrusBerryIcon,
      desc: 'Restores HP when low.',
    },
  ],
  keyitems: [
    {
      id: 'azure_flute',
      name: 'Azure Flute',
      count: 1,
      icon: azureFluteIcon,
      desc: 'A mysterious flute linked to an encounter.',
    },
    {
      id: 'adamant_orb',
      name: 'Adamant Orb',
      count: 1,
      icon: adamantOrbIcon,
      desc: 'A treasure connected to Dialga.',
    },
    {
      id: 'lustrous_orb',
      name: 'Lustrous Orb',
      count: 1,
      icon: lustrousOrbIcon,
      desc: 'A treasure connected to Palkia.',
    },
    {
      id: 'griseous_orb',
      name: 'Griseous Orb',
      count: 1,
      icon: griseousOrbIcon,
      desc: 'A treasure connected to Giratina.',
    },
  ],
};

export const DEFAULT_DEX = [];

