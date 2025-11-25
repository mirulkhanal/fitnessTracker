import React from 'react';
import { SvgProps } from 'react-native-svg';

// Import all fitness icons from the gym-icons folder
import Legs from '../../assets/Icons/gym-icons/body-part-leg.svg';
import Arms from '../../assets/Icons/gym-icons/body-part-muscle.svg';
import Abs from '../../assets/Icons/gym-icons/body-part-six-pack.svg';
import BodyWeight from '../../assets/Icons/gym-icons/body-weight.svg';
import BoxingBag from '../../assets/Icons/gym-icons/boxing-bag.svg';
import BoxingGlove from '../../assets/Icons/gym-icons/boxing-glove.svg';
import Dumbbell01 from '../../assets/Icons/gym-icons/dumbbell-01.svg';
import Dumbbell02 from '../../assets/Icons/gym-icons/dumbbell-02.svg';
import Dumbbell03 from '../../assets/Icons/gym-icons/dumbbell-03.svg';
import BenchPress from '../../assets/Icons/gym-icons/equipment-bench-press.svg';
import ChestPress from '../../assets/Icons/gym-icons/equipment-chest-press.svg';
import Gym01 from '../../assets/Icons/gym-icons/equipment-gym-01.svg';
import Gym02 from '../../assets/Icons/gym-icons/equipment-gym-02.svg';
import Gym03 from '../../assets/Icons/gym-icons/equipment-gym-03.svg';
import Weightlifting from '../../assets/Icons/gym-icons/equipment-weightlifting.svg';
import Expander from '../../assets/Icons/gym-icons/expander.svg';
import GymnasticRings from '../../assets/Icons/gym-icons/gymnastic-rings.svg';
import HandGrip from '../../assets/Icons/gym-icons/hand-grip.svg';
import Kettlebell from '../../assets/Icons/gym-icons/kettlebell.svg';
import Locker from '../../assets/Icons/gym-icons/locker.svg';
import Pool from '../../assets/Icons/gym-icons/pool.svg';
import PunchingBall01 from '../../assets/Icons/gym-icons/punching-ball-01.svg';
import PunchingBall02 from '../../assets/Icons/gym-icons/punching-ball-02.svg';
import PushUpBar from '../../assets/Icons/gym-icons/push-up-bar.svg';
import Shoes from '../../assets/Icons/gym-icons/running-shoes.svg';
import Rope from '../../assets/Icons/gym-icons/skipping-rope.svg';
import TapeMeasure from '../../assets/Icons/gym-icons/tape-measure.svg';
import Towels from '../../assets/Icons/gym-icons/towels.svg';
import Treadmill01 from '../../assets/Icons/gym-icons/treadmill-01.svg';
import Treadmill02 from '../../assets/Icons/gym-icons/treadmill-02.svg';
import Scale from '../../assets/Icons/gym-icons/weight-scale.svg';
import Wellness from '../../assets/Icons/gym-icons/wellness.svg';
import BattleRopes from '../../assets/Icons/gym-icons/workout-battle-ropes.svg';
import Gymnastics from '../../assets/Icons/gym-icons/workout-gymnastics.svg';
import Kicking from '../../assets/Icons/gym-icons/workout-kicking.svg';
import Run from '../../assets/Icons/gym-icons/workout-run.svg';
import Sport from '../../assets/Icons/gym-icons/workout-sport.svg';
import Squats from '../../assets/Icons/gym-icons/workout-squats.svg';
import Stretch from '../../assets/Icons/gym-icons/workout-stretching.svg';
import WarmUp from '../../assets/Icons/gym-icons/workout-warm-up.svg';
import Yoga01 from '../../assets/Icons/gym-icons/yoga-01.svg';
import Yoga02 from '../../assets/Icons/gym-icons/yoga-02.svg';
import Yoga03 from '../../assets/Icons/gym-icons/yoga-03.svg';
import YogaBall from '../../assets/Icons/gym-icons/yoga-ball.svg';
import YogaMat from '../../assets/Icons/gym-icons/yoga-mat.svg';

export type CustomIconComponent = React.FC<SvgProps>;

export const customIcons: Record<string, CustomIconComponent> = {
  // Body parts
  abs: Abs,
  arms: Arms,
  legs: Legs,
  bodyweight: BodyWeight,
  
  // Boxing
  boxingbag: BoxingBag,
  boxingglove: BoxingGlove,
  
  // Dumbbells
  dumbbell01: Dumbbell01,
  dumbbell02: Dumbbell02,
  dumbbell03: Dumbbell03,
  
  // Equipment
  benchpress: BenchPress,
  chest: ChestPress,
  gym01: Gym01,
  gym02: Gym02,
  gym03: Gym03,
  weightlifting: Weightlifting,
  expander: Expander,
  gymnasticrings: GymnasticRings,
  handgrip: HandGrip,
  kettlebell: Kettlebell,
  locker: Locker,
  pool: Pool,
  punchingball01: PunchingBall01,
  punchingball02: PunchingBall02,
  pushupbar: PushUpBar,
  rope: Rope,
  tape: TapeMeasure,
  towels: Towels,
  scale: Scale,
  wellness: Wellness,
  
  // Treadmills
  treadmill01: Treadmill01,
  treadmill02: Treadmill02,
  
  // Workouts
  battleropes: BattleRopes,
  gymnastics: Gymnastics,
  kicking: Kicking,
  run: Run,
  sport: Sport,
  squats: Squats,
  stretch: Stretch,
  warmup: WarmUp,
  
  // Yoga
  yoga01: Yoga01,
  yoga02: Yoga02,
  yoga03: Yoga03,
  yogaball: YogaBall,
  yogamat: YogaMat,
  
  // Running
  shoes: Shoes,
};

export const fitnessIconIds = Object.keys(customIcons);



