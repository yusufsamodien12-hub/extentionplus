import { ChecklistSection } from './types';

export const INITIAL_CHECKLIST: ChecklistSection[] = [
  {
    id: 'introduction',
    title: 'Introduction',
    icon: 'MessageSquare',
    items: [
      { id: 'intro-1', label: 'Used correct greeting at the opening of the call', completed: false, points: 1 },
      { id: 'intro-2', label: 'Confirmed the needs of the customer', completed: false, points: 1 },
      { id: 'intro-3', label: 'Obtained or confirmed the customer’s name at the start', completed: false, points: 1 },
    ],
  },
  {
    id: 'proactive-resolution',
    title: 'Proactive Call Resolution',
    icon: 'Zap',
    items: [
      { id: 'pcr-1', label: 'Displayed active listening throughout the call', completed: false, points: 1 },
      { id: 'pcr-2', label: 'Used effective and tactful probing', completed: false, points: 1 },
      { id: 'pcr-3', label: 'Confirmed all contact details (email, residential address, cellphone)', completed: false, points: 1 },
      { id: 'pcr-4', label: 'Addressed the customer’s need', completed: false, points: 1 },
      { id: 'pcr-5', label: 'Took ownership of the query and managed expectations', completed: false, points: 1 },
      { id: 'pcr-6', label: 'Followed correct processes when handling the query', completed: false, points: 1 },
      { id: 'pcr-7', label: 'Accurately routed the call with proper screening', completed: false, points: 1 },
      { id: 'pcr-8', label: 'Educated the customer on self-service options', completed: false, points: 1 },
      { id: 'pcr-9', label: 'Demonstrated strong product knowledge', completed: false, points: 1 },
    ],
  },
  {
    id: 'engagement-care',
    title: 'Engagement and Care',
    icon: 'Heart',
    items: [
      { id: 'ec-1', label: 'Expressed empathy', completed: false, points: 1 },
      { id: 'ec-2', label: 'Referred to the customer by name appropriately', completed: false, points: 1 },
      { id: 'ec-3', label: 'Maintained a pleasant and professional tone', completed: false, points: 1 },
      { id: 'ec-4', label: 'Maintained consistent politeness', completed: false, points: 1 },
      { id: 'ec-5', label: 'Communicated clearly and simply', completed: false, points: 1 },
      { id: 'ec-6', label: 'Followed correct hold procedures', completed: false, points: 1 },
      { id: 'ec-7', label: 'Avoided unexplained silences', completed: false, points: 1 },
      { id: 'ec-8', label: 'Actively engaged the caller (verbal nods / acknowledgments)', completed: false, points: 1 },
      { id: 'ec-9', label: 'Displayed confidence as a subject matter expert', completed: false, points: 1 },
    ],
  },
  {
    id: 'data-processing',
    title: 'Quality Data Processing',
    icon: 'Database',
    items: [
      { id: 'qdp-1', label: 'Captured customer’s personal information correctly', completed: false, points: 1 },
      { id: 'qdp-2', label: 'Confirmed information using phonetic alphabet', completed: false, points: 1 },
      { id: 'qdp-3', label: 'Logged the case correctly', completed: false, points: 1 },
      { id: 'qdp-4', label: 'Captured sufficient notes and selected correct wrap-up', completed: false, points: 1 },
    ],
  },
  {
    id: 'call-closure',
    title: 'Call Closure',
    icon: 'Flag',
    items: [
      { id: 'cc-1', label: 'Provided case number before ending the call', completed: false, points: 1 },
      { id: 'cc-2', label: 'Provided expected resolution time', completed: false, points: 1 },
      { id: 'cc-3', label: 'Offered further assistance', completed: false, points: 1 },
      { id: 'cc-4', label: 'Asked the customer to participate in the survey', completed: false, points: 1 },
      { id: 'cc-5', label: 'Thanked the customer and extended well wishes', completed: false, points: 1 },
    ],
  },
];
