import Marquee from "react-fast-marquee";

function MarqueeCards({ children, direction }) {
  return (
    <Marquee direction={direction} gradient={false} speed={100} play={false}>
      {children}
    </Marquee>
  );
}

export default MarqueeCards;
