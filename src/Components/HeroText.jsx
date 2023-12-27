import { m, LazyMotion, domAnimation } from "framer-motion";

function HeroText() {
  const name = "theParsius?";

  return (
    <div
      className="noselect w-fit h-fit text-grayscale-50 absolute z-10 flex flex-col justify-center items-center rounded-[50%]"
      id="repulse-div"
    >
      <LazyMotion features={domAnimation} strict>
        <m.h1
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="text-center flex justify-center items-center flex-col opacity-100
                     text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl cursor-default"
          style={{ fontFamily: "Permanent Marker" }}
        >
          <m.span
            initial={{ x: -100 }}
            whileInView={{ x: 0 }}
            transition={{ duration: 0.6, type: "spring" }}
          >
            Who's{" "}
          </m.span>
          <m.div
            initial={{ x: 100 }}
            whileInView={{ x: 0 }}
            transition={{ duration: 0.6, type: "spring" }}
          >
            {name.split("").map((char, index) => (
              <span
                key={index}
                className="text-primary-400 bounce"
                style={{ fontSize: "1.2em" }}
              >
                {char}
              </span>
            ))}
          </m.div>
        </m.h1>
      </LazyMotion>
    </div>
  );
}

export default HeroText;
