import { addOrSubtractDaysFromDate } from "@/utils/date";
import { StaticImageData } from "next/image";
import avatar3 from "@/assets/images/users/avatar-3.jpg";
import avatar4 from "@/assets/images/users/avatar-4.jpg";

export type ArticleType = {
  title: string;
  description: string;
  name: string;
  date: Date;
  tags: string[];
  image: StaticImageData;
};

export type PostType = {
  link: string;
  title: string;
  description: string;
  name: string;
  date: Date;
  tags: string[];
};

export const articleData: ArticleType[] = [
  {
    title:
      "New Community Guidelines: Important Updates for All Residents - Please Review and Follow",
    date: addOrSubtractDaysFromDate(50),
    description:
      "We have updated our community guidelines to ensure a safe and harmonious living environment for all residents. Please review these important changes and ensure compliance.",
    name: "Jason M. Boone",
    tags: ["Guidelines", "Notice", "Community"],
    image: avatar3,
  },
  {
    title:
      "Maintenance Schedule Updates: Upcoming Building Improvements and Temporary Service Disruptions",
    date: addOrSubtractDaysFromDate(250),
    description:
      "We will be conducting essential maintenance work across the community facilities. This notice outlines the schedule and expected service disruptions during the improvement period.",
    name: "Billy J. Woodward",
    tags: ["Maintenance", "Notice"],
    image: avatar4,
  },
];

export const postData: PostType[] = [
  {
    link: "https://www.youtube.com/embed/PrUxWZiQfy4?autohide=0&showinfo=0&controls=0",
    title: "Community Security Updates and Safety Protocols",
    description:
      "Important updates regarding community security measures and new safety protocols that all residents should be aware of for enhanced safety.",
    name: "Kelly L. Jones",
    date: addOrSubtractDaysFromDate(45),
    tags: ["Security", "News"],
  },
  {
    link: "https://www.youtube.com/embed/D89Dgg32yLk?si=hxvuTzNEzCyfuBN1",
    title: "Monthly Community Board Meeting Summary",
    description:
      "Summary of key decisions and announcements from the latest community board meeting, including budget updates and upcoming community events.",
    name: "Tim T. Dame",
    date: addOrSubtractDaysFromDate(145),
    tags: ["Notice", "News"],
  },
  {
    link: "https://www.youtube.com/embed/qBpY4MJt6lc?si=LXHNQxR1XHEt_5VT",
    title: "Amenity Booking System: New Rules and Procedures",
    description:
      "Updated procedures for booking community amenities including the gym, clubhouse, and pool area. Please review the new booking guidelines.",
    name: "Manuel B. Barry",
    date: addOrSubtractDaysFromDate(185),
    tags: ["Notice", "Amenities"],
  },
  {
    link: "https://www.youtube.com/embed/wEw4A7CcSWU?si=BWA7J4IpWkiYvypk",
    title: "Guest Registration and Visitor Policy Updates",
    description:
      "New visitor registration procedures and guest policy updates to enhance security and ensure smooth access for your guests and visitors.",
    name: "Obdulia J. Gatlin",
    date: addOrSubtractDaysFromDate(385),
    tags: ["Visitors", "News"],
  },
  {
    link: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0&mute=1",
    title: "Community Gym Equipment Training Session",
    description:
      "Learn how to properly use all the new gym equipment with our certified fitness trainer. Safety guidelines and workout tips included.",
    name: "Marcus J. Thompson",
    date: addOrSubtractDaysFromDate(15),
    tags: ["Fitness", "Tutorial"],
  },
  {
    link: "https://www.youtube.com/embed/3JZ_D3ELwOQ?autoplay=0&mute=1",
    title: "Pool Area Safety and Swimming Guidelines",
    description:
      "Important safety protocols for the community pool area, swimming rules, and emergency procedures for all residents and their guests.",
    name: "Sarah M. Rodriguez",
    date: addOrSubtractDaysFromDate(25),
    tags: ["Safety", "Amenities"],
  },
  {
    link: "https://www.youtube.com/embed/kJQP7kiw5Fk?autoplay=0&mute=1",
    title: "Landscaping and Garden Maintenance Schedule",
    description:
      "Overview of our community landscaping improvements and garden maintenance schedule. Learn about seasonal plantings and irrigation updates.",
    name: "David L. Chen",
    date: addOrSubtractDaysFromDate(35),
    tags: ["Maintenance", "Landscaping"],
  },
  {
    link: "https://www.youtube.com/embed/L_jWHffIx5E?autoplay=0&mute=1",
    title: "Emergency Evacuation Procedures and Safety Drills",
    description:
      "Comprehensive guide to emergency evacuation routes, safety procedures, and upcoming emergency drill schedules for all residents.",
    name: "Jennifer K. Williams",
    date: addOrSubtractDaysFromDate(55),
    tags: ["Emergency", "Safety"],
  },
  {
    link: "https://www.youtube.com/embed/ZZ5LpwO-An4?autoplay=0&mute=1",
    title: "Waste Management and Recycling Guidelines",
    description:
      "Updated waste management procedures, recycling guidelines, and pickup schedules to maintain our community's environmental standards.",
    name: "Robert A. Johnson",
    date: addOrSubtractDaysFromDate(65),
    tags: ["Environment", "Guidelines"],
  },
  {
    link: "https://www.youtube.com/embed/fJ9rUzIMcZQ?autoplay=0&mute=1",
    title: "Community Event Planning and Volunteer Opportunities",
    description:
      "Discover upcoming community events and learn about volunteer opportunities to help organize activities and strengthen neighborhood bonds.",
    name: "Lisa P. Anderson",
    date: addOrSubtractDaysFromDate(75),
    tags: ["Events", "Community"],
  },
  {
    link: "https://www.youtube.com/embed/oHg5SJYRHA0?autoplay=0&mute=1",
    title: "Pet Policy Updates and Dog Park Guidelines",
    description:
      "Important updates to our pet policy including new dog park rules, leash requirements, and pet registration procedures for all residents.",
    name: "Michelle T. Davis",
    date: addOrSubtractDaysFromDate(85),
    tags: ["Pets", "Guidelines"],
  },
  {
    link: "https://www.youtube.com/embed/SQoA_wjmE9w?autoplay=0&mute=1",
    title: "Parking Rules and Vehicle Registration Updates",
    description:
      "Updated parking regulations, visitor parking procedures, and vehicle registration requirements to ensure organized parking management.",
    name: "Kevin M. Wilson",
    date: addOrSubtractDaysFromDate(95),
    tags: ["Parking", "Regulations"],
  },
];
