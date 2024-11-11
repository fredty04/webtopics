gsap.registerPlugin(ScrollTrigger);

gsap.from("#header", {
    y: -100, 
    opacity: 0, 
    duration: 1,
    ease: "power2.out",
    scrollTrigger: {
        trigger: "#header", 
        start: "top top", 
        end: "bottom top", 
        scrub: true, 
        markers: false
    }
});


const sections = document.querySelectorAll("section");
sections.forEach(section => {
    gsap.fromTo(section,
        { scale: 0.8, opacity: 0 },
        {
            scale: 1,
            opacity: 1,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
                trigger: section,
                start: "top 80%",
                end: "bottom top",
                scrub: true,
                markers: false,
                onEnter: () => {
                    gsap.to(section, {
                        backgroundColor: "var(--secondary)",
                        duration: 0.5,
                        ease: "power2.inOut"
                    });
                },
                onLeaveBack: () => {
                    gsap.to(section, {
                        backgroundColor: "white",
                        duration: 0.5,
                        ease: "power2.inOut"
                    });
                }
            }
        }
    );
});

const tooltip = document.getElementById("my-tooltip");
const tooltipTitle = document.getElementById("tooltip-title");
const tooltipDescription = document.getElementById("tooltip-description");


const navLinks = document.querySelectorAll("#header nav ul li a");

navLinks.forEach(link => {
    link.addEventListener("mouseenter", () => {
        gsap.to(link, {
            scale: 2,
            color: "#FFFFFF",
            duration: 0.5,
            ease: "power2.out"
        });
    });

    link.addEventListener("mouseleave", () => {
        gsap.to(link, {
            scale: 1,
            color: "#4f543b",
            duration: 0.3,
            ease: "power2.out"
        });
    });
});
