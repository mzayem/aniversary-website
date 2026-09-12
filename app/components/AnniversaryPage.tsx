"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HeartScene from "./HeartScene";

const MET_DATE = new Date(2024, 8, 13);
const HEART_PATH =
  "M50 88 C22 68 6 50 6 32 C6 18 17 8 30 8 C39 8 46 13 50 20 C54 13 61 8 70 8 C83 8 94 18 94 32 C94 50 78 68 50 88 Z";

function Heart({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 96" className={className} aria-hidden="true">
      <path d={HEART_PATH} />
    </svg>
  );
}

function daysTogether() {
  return Math.max(0, Math.floor((Date.now() - MET_DATE.getTime()) / 86400000));
}

function yearsCompleted(now: Date) {
  let years = now.getFullYear() - MET_DATE.getFullYear();
  const hadAnniversaryThisYear =
    now.getMonth() > MET_DATE.getMonth() ||
    (now.getMonth() === MET_DATE.getMonth() && now.getDate() >= MET_DATE.getDate());
  if (!hadAnniversaryThisYear) years -= 1;
  return Math.max(0, years);
}

const MILESTONES = [
  {
    when: "13 September 2024",
    title: "The day you showed up",
    text: "No fireworks, no warning sign — just a Friday that forgot to mention it was about to become my favourite one.",
  },
  {
    when: "Soon after",
    title: "The first promise I kept",
    text: "I said I'd be there. I was. I genuinely thought that made me a hero — turns out it's just called showing up, but I'll take the credit anyway.",
  },
  {
    when: "Every day since",
    title: "The boring parts I fell for too",
    text: "The 2am voice notes, the same three jokes on repeat, you ‘borrowing’ my hoodies and calling it a merger — turns out I love the unremarkable half just as much.",
  },
  {
    when: "13 September 2026",
    title: "Year three, let's go",
    text: "Older, wiser, still occasionally ridiculous — mostly me. Whatever's next, I've already decided who I'm dragging along for it.",
  },
];

const PROMISES = [
  {
    title: "You hear it from me first",
    text: "Good news, bad news, questionable 3am thoughts — you get the exclusive, every time.",
  },
  {
    title: "Same me, even off-camera",
    text: "No secret evil twin. What you get is what you're stuck with, on the good days and the boring ones.",
  },
  {
    title: "Your team, no substitutions",
    text: "Awkward family dinners, group chats gone wrong, actual arguments — I'm permanently drafted to your side.",
  },
  {
    title: "We talk it out, not shut it down",
    text: "No silent treatments. Just the uncomfortable conversation tonight, then probably ordering food after.",
  },
  {
    title: "Your dreams get the loud hype-man treatment",
    text: "Whatever you decide to build next, I'm already telling everyone about it before you've finished the sentence.",
  },
];

export default function AnniversaryPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const threadFillRef = useRef<HTMLDivElement>(null);
  const tallyRef = useRef<HTMLParagraphElement>(null);
  const tickerRef = useRef<HTMLParagraphElement>(null);
  const yearBadgeRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    document.body.classList.add("loaded");
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (tallyRef.current && reduced) {
      tallyRef.current.textContent = daysTogether().toLocaleString();
    }
    if (yearBadgeRef.current) {
      yearBadgeRef.current.textContent = `in year ${yearsCompleted(new Date()) + 1} of us`;
    }

    function tick() {
      if (!tickerRef.current) return;
      const ms = Date.now() - MET_DATE.getTime();
      const h = Math.floor(ms / 3600000) % 24;
      const m = Math.floor(ms / 60000) % 60;
      const s = Math.floor(ms / 1000) % 60;
      tickerRef.current.textContent = `${h}h ${m}m ${s}s since — still counting, still not bored`;
    }
    tick();
    const tickInterval = setInterval(tick, 1000);

    let ctx: gsap.Context | undefined;

    if (!reduced) {
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        if (threadFillRef.current && storyRef.current) {
          gsap.fromTo(
            threadFillRef.current,
            { height: "0%" },
            {
              height: "100%",
              ease: "none",
              scrollTrigger: {
                trigger: storyRef.current,
                start: "top 65%",
                end: "bottom 60%",
                scrub: 0.5,
              },
            }
          );
        }

        gsap.utils.toArray<HTMLElement>(".milestone").forEach((el) => {
          const fromLeft = el.classList.contains("left");
          gsap.fromTo(
            el,
            { rotateY: fromLeft ? -55 : 55, z: -140, opacity: 0 },
            {
              rotateY: 0,
              z: 0,
              opacity: 1,
              ease: "back.out(1.5)",
              scrollTrigger: {
                trigger: el,
                start: "top 88%",
                end: "top 55%",
                scrub: 0.7,
              },
            }
          );
          ScrollTrigger.create({
            trigger: el,
            start: "top 80%",
            once: true,
            onEnter: () => el.classList.add("seen"),
          });
        });

        const counterEl = document.querySelector(".counter");
        if (counterEl) {
          gsap.fromTo(
            counterEl,
            { scale: 0.82, rotateX: 10, opacity: 0 },
            {
              scale: 1,
              rotateX: 0,
              opacity: 1,
              ease: "back.out(1.4)",
              scrollTrigger: {
                trigger: counterEl,
                start: "top 85%",
                end: "top 50%",
                scrub: 0.6,
              },
            }
          );
        }

        if (tallyRef.current) {
          ScrollTrigger.create({
            trigger: tallyRef.current,
            start: "top 85%",
            once: true,
            onEnter: () => {
              const obj = { val: 0 };
              const target = daysTogether();
              gsap.to(obj, {
                val: target,
                duration: 1.8,
                ease: "back.out(1.3)",
                onUpdate: () => {
                  if (tallyRef.current) {
                    tallyRef.current.textContent = Math.max(0, Math.round(obj.val)).toLocaleString();
                  }
                },
              });
            },
          });
        }

        gsap.utils.toArray<HTMLElement>(".promise").forEach((el, i) => {
          const dir = i % 2 === 0 ? -1 : 1;
          gsap.fromTo(
            el,
            { rotateZ: dir * 4, x: dir * -36, opacity: 0, scale: 0.92 },
            {
              rotateZ: 0,
              x: 0,
              opacity: 1,
              scale: 1,
              ease: "back.out(1.4)",
              scrollTrigger: {
                trigger: el,
                start: "top 92%",
                end: "top 68%",
                scrub: 0.6,
              },
            }
          );
        });

        const quote = document.querySelector(".letter blockquote");
        if (quote) {
          gsap.fromTo(
            quote,
            { opacity: 0, y: 28, rotateX: 8 },
            {
              opacity: 1,
              y: 0,
              rotateX: 0,
              ease: "power2.out",
              scrollTrigger: {
                trigger: ".letter",
                start: "top 80%",
                end: "top 50%",
                scrub: 0.5,
              },
            }
          );
        }

        const finaleHeading = document.querySelector(".finale h2");
        if (finaleHeading) {
          gsap.fromTo(
            finaleHeading,
            { opacity: 0, scale: 0.85 },
            {
              opacity: 1,
              scale: 1,
              ease: "back.out(1.3)",
              scrollTrigger: {
                trigger: ".finale",
                start: "top 85%",
                end: "top 55%",
                scrub: 0.6,
              },
            }
          );
        }

        gsap.fromTo(
          ".finale p, .finale .send",
          { opacity: 0, y: 22 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: ".finale",
              start: "top 75%",
              end: "top 50%",
              scrub: 0.5,
            },
          }
        );
      }, rootRef);
    } else if (threadFillRef.current) {
      threadFillRef.current.style.height = "100%";
    }

    return () => {
      clearInterval(tickInterval);
      ctx?.revert();
    };
  }, []);

  function sendHeart(e: React.MouseEvent<HTMLButtonElement>) {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const n = reduced ? 5 : 18;
    const ns = "http://www.w3.org/2000/svg";

    for (let i = 0; i < n; i++) {
      const svg = document.createElementNS(ns, "svg");
      svg.setAttribute("viewBox", "0 0 100 96");
      svg.setAttribute("class", "burst");
      const path = document.createElementNS(ns, "path");
      path.setAttribute("d", HEART_PATH);
      svg.appendChild(path);
      if (Math.random() > 0.7) svg.style.fill = "var(--gold)";

      const angle = Math.random() * Math.PI * 2;
      const dist = 90 + Math.random() * 230;
      svg.style.left = `${cx - 10}px`;
      svg.style.top = `${cy - 10}px`;
      document.body.appendChild(svg);

      gsap.to(svg, {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist - 110,
        scale: 1.15,
        opacity: 0,
        duration: 1 + Math.random() * 0.8,
        ease: "power2.out",
        onComplete: () => svg.remove(),
      });
    }
  }

  return (
    <div ref={rootRef}>
      <HeartScene />

      <section className="hero">
        <div className="wrap">
          <p className="stamp lift d1">Officially taken since 13 Sept 2024</p>

          <h1 className="names lift d2">
            M. Zayem
            <span className="amp">&amp;</span>
            Shakiba Sultan
          </h1>

          <p className="sub lift d3">
            One ordinary Friday, zero warning signs, and somehow the best plot twist I never saw coming.
          </p>

          <p className="scroll-hint lift d4">
            keep scrolling — there&rsquo;s two years of us down here
            <span />
          </p>
        </div>
      </section>

      <section className="story" ref={storyRef}>
        <div className="thread" aria-hidden="true">
          <i ref={threadFillRef} />
        </div>
        <div className="wrap">
          {MILESTONES.map((m, i) => (
            <article className={`milestone panel ${i % 2 === 0 ? "left" : "right"}`} key={m.title}>
              <span className="when">{m.when}</span>
              <h2>{m.title}</h2>
              <p>{m.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="counter">
        <div className="wrap">
          <p className="lead">since that one Friday</p>
          <p className="tally" ref={tallyRef}>
            0
          </p>
          <p className="unit">days of you — and I&rsquo;d sign up for every single one again</p>
          <p className="year-badge" ref={yearBadgeRef} />
          <p className="ticker" ref={tickerRef}>
            &nbsp;
          </p>
        </div>
      </section>

      <section className="promises">
        <div className="wrap">
          <h2>Pinky promises</h2>
          <ul className="promise-list">
            {PROMISES.map((p) => (
              <li className="promise panel" key={p.title}>
                <Heart />
                <div>
                  <strong>{p.title}</strong>
                  <span>{p.text}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="letter">
        <div className="wrap">
          <blockquote>
            Of everyone I could&rsquo;ve been accidentally seated next to on a random Friday, I am extremely
            glad it was you.
          </blockquote>
          <p className="sign">— Zayem, still not over it</p>
        </div>
      </section>

      <section className="finale">
        <div className="wrap">
          <h2>
            Happy anniversary,
            <br />
            <em>Shakiba</em>
          </h2>
          <p>
            Here&rsquo;s to the Friday we met, the two years of chaos since, and however many more you&rsquo;ll
            let me stick around for.
          </p>
          <button className="send" onClick={sendHeart}>
            Send Shakiba a heart
          </button>
        </div>
      </section>

      <footer>made with mild chaos, for Shakiba Sultan · 13 September</footer>
    </div>
  );
}
