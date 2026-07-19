import {
  agentData,
  customerData,
  customerReviewsData,
  dataTableRecords,
  pricingData,
  projectsData,
  propertyData,
  timelineData,
  transactionData,
  userData,
} from "@/assets/data/other";
import { sellersData } from "@/assets/data/product";
import { emailsData, socialGroupsData } from "@/assets/data/social";
import { todoData } from "@/assets/data/task";
import { notificationsData } from "@/assets/data/topbar";
import {
  AgentType,
  CustomerReviewsType,
  CustomerType,
  EmailCountType,
  EmailLabelType,
  Employee,
  GroupType,
  NotificationType,
  PricingType,
  ProjectType,
  PropertyType,
  TimelineType,
  TodoType,
  TransactionType,
  UserType,
} from "@/types/data";
import { sleep } from "@/utils/promise";
import * as yup from "yup";

export const getNotifications = async (): Promise<NotificationType[]> => {
  return notificationsData;
};

export const getAllUsers = async (): Promise<UserType[]> => {
  // For now, return the original dummy data to ensure UI works
  // This maintains the existing functionality while we work on the backend integration
  await sleep();
  return userData;
};

// Get users filtered by email category
export const getUsersByEmailCategory = async (category?: EmailLabelType): Promise<UserType[]> => {
  await sleep();
  
  if (!category || category === "inbox") {
    return userData.filter(u => u.emailFolder === "inbox");
  }
  
  switch (category) {
    case "starred":
      return userData.filter(u => u.isStarred);
    case "important":
      return userData.filter(u => u.isImportant);
    case "draft":
      return userData.filter(u => u.emailFolder === "draft" || u.isDraft);
    case "sent":
      return userData.filter(u => u.emailFolder === "sent");
    case "deleted":
      return userData.filter(u => u.emailFolder === "deleted");
    case "Promotions":
      return userData.filter(u => u.emailFolder === "Promotions");
    case "Updates":
      return userData.filter(u => u.emailFolder === "Updates");
    case "snoozed":
      return userData.filter(u => u.emailFolder === "snoozed");
    case "spam":
      return userData.filter(u => u.emailFolder === "spam");
    case "archive":
      return userData.filter(u => u.emailFolder === "archive");
    default:
      // Handle labels
      if (category?.startsWith("label:")) {
        const label = category.replace("label:", "");
        return userData.filter(u => u.labels?.includes(label));
      }
      // Handle contacts
      if (category?.startsWith("contact:")) {
        const contactId = category.replace("contact:", "");
        return userData.filter(u => u.id === contactId);
      }
      return userData.filter(u => u.emailFolder === "inbox");
  }
};

// Get users filtered by label
export const getUsersByLabel = async (label: string): Promise<UserType[]> => {
  await sleep();
  return userData.filter(user => user.labels?.includes(label));
};

// Get users filtered by contact selection
export const getUsersByContact = async (contactId: string): Promise<UserType[]> => {
  await sleep();
  // Return emails from/to this specific contact
  return userData.filter(user => user.id === contactId);
};

// Get label counts
export const getLabelCounts = () => {
  const counts = {
    Collaboration: userData.filter(u => u.labels?.includes("Collaboration")).length,
    "New Client": userData.filter(u => u.labels?.includes("New Client")).length,
    Wedding: userData.filter(u => u.labels?.includes("Wedding")).length,
  };
  return counts;
};

export const getAllProperty = async (): Promise<PropertyType[]> => {
  return propertyData;
};

export const getAllTransaction = async (): Promise<TransactionType[]> => {
  const data = transactionData.map((item) => {
    const user = userData.find((user) => user.id === item.userId);
    const property = propertyData.find(
      (property) => property.id == item.propertyId,
    );
    return {
      ...item,
      user,
      property,
    };
  });
  await sleep();
  return data;
};

export const getAllTimeline = async (): Promise<TimelineType> => {
  await sleep();
  return timelineData;
};

export const getAllAgent = async (): Promise<AgentType[]> => {
  const data = agentData.map((item) => {
    const user = userData.find((user) => user.id == item.userId);
    return {
      ...item,
      user,
    };
  });
  await sleep();
  return data;
};

export const getAllPricingPlans = async (): Promise<PricingType[]> => {
  await sleep();
  return pricingData;
};

export const getAllCustomer = async (): Promise<CustomerType[]> => {
  const data = customerData.map((item) => {
    const user = userData.find((user) => user.id == item.userId);
    return {
      ...item,
      user,
    };
  });
  await sleep();
  return data;
};

export const getAllReview = async (): Promise<CustomerReviewsType[]> => {
  const data = customerReviewsData.map((item) => {
    const user = userData.find((user) => user.id === item.userId);
    const property = propertyData.find(
      (property) => property.id == item.propertyId,
    );
    return {
      ...item,
      user,
      property,
    };
  });
  await sleep();
  return data;
};

export const getUserById = async (
  id: UserType["id"],
): Promise<UserType | void> => {
  const user = userData.find((user) => user.id === id);
  if (user) {
    await sleep();
    return user;
  }
};

export const getJoinedGroups = async (): Promise<GroupType[]> => {
  return socialGroupsData;
};

export const getEmailsCategoryCount = async (): Promise<EmailCountType> => {
  // Count emails dynamically based on userData categories
  await sleep();
  
  const users = userData;
  
  const counts: EmailCountType = {
    inbox: users.filter(u => u.emailFolder === "inbox").length,
    starred: users.filter(u => u.isStarred).length,
    draft: users.filter(u => u.emailFolder === "draft" || u.isDraft).length,
    sent: users.filter(u => u.emailFolder === "sent").length,
    deleted: users.filter(u => u.emailFolder === "deleted").length,
    important: users.filter(u => u.isImportant).length,
    promotions: users.filter(u => u.emailFolder === "Promotions").length,
    updates: users.filter(u => u.emailFolder === "Updates").length,
    snoozed: users.filter(u => u.emailFolder === "snoozed").length,
  };
  
  return counts;
};

export const getAllProjects = async (): Promise<ProjectType[]> => {
  await sleep();
  return projectsData;
};

export const getAllTasks = async (): Promise<TodoType[]> => {
  const data = todoData.map((task) => {
    const employee = sellersData.find(
      (seller) => seller.id === task.employeeId,
    );
    return {
      ...task,
      employee,
    };
  });
  await sleep();
  return data;
};

export const getAllFriends = async (): Promise<UserType[]> => {
  const data = userData.filter((user) => !user?.hasRequested);
  await sleep();
  return data;
};

export const serverSideFormValidate = async (
  data: unknown,
): Promise<unknown> => {
  const formSchema = yup.object({
    fName: yup
      .string()
      .min(3, "First name should have at least 3 characters")
      .max(50, "First name should not be more than 50 characters")
      .required("First name is required"),
    lName: yup
      .string()
      .min(3, "Last name should have at least 3 characters")
      .max(50, "Last name should not be more than 50 characters")
      .required("Last name is required"),
    username: yup
      .string()
      .min(3, "Username should have at least 3 characters")
      .max(20, "Username should not be more than 20 characters")
      .required("Username is required"),
    city: yup
      .string()
      .min(3, "City should have at least 3 characters")
      .max(20, "City should not be more than 20 characters")
      .required("City is required"),
    state: yup
      .string()
      .min(3, "State should have at least 3 characters")
      .max(20, "State should not be more than 20 characters")
      .required("State is required"),
    zip: yup.number().required("ZIP is required"),
  });

  try {
    const validatedObj = await formSchema.validate(data, { abortEarly: false });
    return validatedObj;
  } catch (error) {
    return error;
  }
};

export const getAllDataTableRecords = async (): Promise<Employee[]> => {
  await sleep();
  return dataTableRecords;
};

// Get unique email content for each user based on their email preview
export const getEmailContent = (userId: string) => {
  const emailContents: Record<string, {
    subject: string;
    content: string;
    recipient: string;
  }> = {
    "1": {
      subject: "Project Update and Next Steps",
      content: `Thank you all for your hard work and dedication to this project. Your contributions are invaluable, and I am confident that together we will achieve our goals successfully. After reviewing the current progress and considering various factors, I would like to share some observations and next steps.

The development phase has been progressing smoothly, and we're on track to meet our initial milestone. The team's collaboration has been exceptional, and the quality of work delivered so far exceeds our expectations.

However, I wanted to address a few areas where we can optimize our workflow to ensure we maintain this momentum throughout the project lifecycle.`,
      recipient: "Project Team"
    },
    "2": {
      subject: "Recognition and Achievement Award",
      content: `In recognition of your achievements and outstanding performance over the past quarter, we are pleased to announce that you have been selected for our Excellence Award program.

Your dedication to maintaining high standards and your innovative approach to problem-solving has not gone unnoticed. The management team has been consistently impressed with your contributions to our recent projects.

As part of this recognition, you will receive a performance bonus and additional responsibilities that align with your career growth objectives.`,
      recipient: "All Department Heads"
    },
    "3": {
      subject: "Upcoming Team Meeting Reminder",
      content: `Additionally, I would like to remind everyone of our upcoming team meeting scheduled for this Thursday at 2:00 PM in the main conference room.

During this meeting, we will discuss the revised timeline in detail and address any concerns or questions you may have regarding the project deliverables. Please come prepared with your progress reports and any blockers you're currently facing.

We'll also be introducing the new project management tools that will help streamline our communication and task tracking going forward.`,
      recipient: "Development Team"
    },
    "4": {
      subject: "Current Progress Review and Updates",
      content: `After reviewing the current progress on our Q4 initiatives, I'm pleased to report that most teams are meeting or exceeding their targets. The metrics show significant improvement across all key performance indicators.

The client feedback has been overwhelmingly positive, particularly regarding the user experience improvements we implemented last month. This validates our decision to prioritize user-centric design in our development process.

Moving forward, we'll be scaling these successful strategies to other product lines and exploring opportunities for further innovation.`,
      recipient: "Management Team"
    },
    "5": {
      subject: "Project Timeline Adjustment Notice",
      content: `We have decided to adjust the deadline for the current project to allow for additional quality assurance testing and feature refinement. The new target date has been moved to two weeks later than originally planned.

This adjustment will ensure that we deliver a product that meets our high standards and provides the best possible experience for our end users. The additional time will also allow our QA team to conduct more comprehensive testing scenarios.

Please update your schedules accordingly and let me know if this change affects any of your other project commitments.`,
      recipient: "Project Stakeholders"
    },
    "6": {
      subject: "Appreciation and Support Message",
      content: `We'd like to thank you for being such an exceptional member of our community. Your active participation and valuable contributions have made a significant impact on our collective success.

Your insights during our recent brainstorming sessions have led to several innovative solutions that we're now implementing across multiple projects. The positive energy you bring to team interactions is truly appreciated by everyone.

As we move into the next phase of our growth, we're excited to continue working with individuals like you who embody our core values of excellence and collaboration.`,
      recipient: "Community Members"
    },
    "7": {
      subject: "February Compensation and Bonus Notification",
      content: `February, you will be paid to your nominated account as per our standard payroll schedule. Additionally, we're pleased to inform you that you've qualified for the quarterly performance bonus based on your exceptional results.

The bonus calculation is based on the goals you achieved during the review period, including the successful completion of three major client projects and your leadership in the new team member onboarding process.

The total amount will be reflected in your next paycheck, and you should receive a detailed breakdown via email within the next 24 hours.`,
      recipient: "Payroll Recipients"
    },
    "8": {
      subject: "Cash Reward Program Announcement",
      content: `$250 cash reward. This will be paid out to eligible participants who have successfully completed all requirements of our customer feedback program during the past month.

Your participation in gathering user insights and providing detailed analysis has been instrumental in helping us improve our services. The feedback you collected has directly influenced several product enhancements that will be released next quarter.

To claim your reward, please complete the attached form and submit it to the HR department by Friday. Processing typically takes 5-7 business days.`,
      recipient: "Program Participants"
    },
    "9": {
      subject: "Team Collaboration and Success",
      content: `Thank you all for your hard work and commitment to excellence in everything we do. The recent project completion marks another milestone in our journey toward becoming the industry leader in our field.

The collaboration between departments has been seamless, and the results speak for themselves. Our client satisfaction scores have reached an all-time high, and we've received multiple referrals from our existing customer base.

This success wouldn't have been possible without each team member's dedication and willingness to go above and beyond their regular responsibilities.`,
      recipient: "All Staff"
    },
    // Add content for additional users (drafts, promotions, updates)
    "10": {
      subject: "Project Proposal Draft - Review Required",
      content: "Project proposal draft needs review and approval before final submission. The document outlines our strategic approach for the upcoming quarter and includes detailed budget allocations, timeline projections, and resource requirements.",
      recipient: "Management Team"
    },
    "16": {
      subject: "Weekend Special - 50% Off Selected Items",
      content: "50% off selected items this weekend only! Don't miss out on our biggest sale of the season. Offer valid on premium products and services. Limited time offer expires Sunday at midnight.",
      recipient: "Valued Customers"
    },
    "19": {
      subject: "Scheduled System Maintenance - This Weekend",
      content: "Scheduled maintenance this weekend from 2 AM to 6 AM on Saturday. During this time, some services may be temporarily unavailable. We appreciate your patience as we improve our infrastructure.",
      recipient: "All Users"
    },
    "24": {
      subject: "Database Migration Completed Successfully",
      content: "Database schema updated successfully with improved performance and new features. All data has been migrated without loss, and the new indexes will significantly improve query performance.",
      recipient: "Development Team"
    },
    "34": {
      subject: "Weekly Team Meeting - Snoozed Reminder",
      content: "Weekly team meeting scheduled for tomorrow at 10:00 AM in Conference Room A. This reminder was snoozed until today. Please prepare your status updates and any blockers you're currently facing.",
      recipient: "Team Members"
    },
    "36": {
      subject: "Suspicious Email Activity Detected",
      content: "Suspicious activity detected in email. This message has been automatically flagged as potential spam due to unusual sender patterns and suspicious links. Please do not interact with this email.",
      recipient: "Security Alert"
    },
    "37": {
      subject: "Project Files Archived - Q3 Documentation",
      content: "Project files have been archived for long-term storage. All Q3 project documentation, meeting notes, and deliverables have been moved to the archive folder for future reference and compliance purposes.",
      recipient: "Archive System"
    },
    "38": {
      subject: "Email Moved to Trash",
      content: "This email has been deleted and moved to the trash folder. The content is no longer active but is retained for recovery purposes. Items in trash will be permanently deleted after 30 days.",
      recipient: "Trash Folder"
    }
  };

  return emailContents[userId] || emailContents["1"]; // Default to first user's content
};
