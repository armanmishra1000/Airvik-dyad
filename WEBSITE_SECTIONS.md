# Website Changes Tracker

This document tracks only the sections where specific changes need to be made.

---

## 🔄 Pending Changes

### WelcomeSection
**File:** `src/components/marketing/home/WelcomeSection.tsx`

- [x] **Main Heading Update**
  - Update heading text to wrap after "for": "A Sacred Space for <br />the Welfare of All"
  - Apply new heading style: `2xl:text-5xl md:text-4xl text-3xl font-bold text-foreground`
  - Remove old style: `text-4xl md:text-5xl font-bold font-serif text-foreground`
  
- [x] **Ashram Activities Section**
  - Change `h3` tag to `h2` tag for "Our Sacred Activities" heading
  - Apply heading style: `2xl:text-5xl md:text-4xl text-3xl font-bold text-foreground`
  - Remove old style: `text-4xl md:text-5xl font-bold font-serif text-foreground mb-2`
  - Update description paragraph style to: `text-base text-muted-foreground md:text-lg`
  - Add `max-w-xl mx-auto` to description paragraph
  - Remove `mb-2` from parent div of the logo image
  - Remove `mt-10` from logo image className
  
- [x] **Spacing Updates (Line 164)**
  - Add `space-y-4` to the text-center container
  - Remove `mb-16` from the same container
  
- [x] **Grid Spacing (Line 189)**
  - Add `mt-12` to the activities grid container

### GallerySection
**File:** `src/components/marketing/home/GallerySection.tsx`

- [x] **Layout and Styling Updates**
  - Line 66: Apply `py-10 sm:py-12` to the `<section>` tag
  - Line 69: Remove `mb-16` and add `space-y-4`
  - Add a parent `<div>` with `className="flex items-center justify-center gap-4"`
  - Inside this parent div, place both:
    - `<h2>` tag with style: `2xl:text-5xl md:text-4xl text-3xl font-bold text-foreground`
    - `<Image>` tag with `/om.png` and `className="object-contain"`
  - Apply style to `<p>` tag: `text-base text-muted-foreground md:text-lg max-w-3xl mx-auto`
  - Remove original image code from lines 82-90
  - Line 93: Remove `max-w-7xl mx-auto` and add `mt-12`

### VideoSection
**File:** `src/components/marketing/home/VideoSection.tsx`

- [x] **Layout and Styling Updates**
  - Line 124: Remove `to-secondary/20` and `bg-background`
  - Line 127: Remove `mb-16` and add `space-y-4`
  - Line 133: Remove `mb-4` and add `gap-4`
  - Line 134: Replace `<h3>` tag with `<h2>` tag and apply heading style: `2xl:text-5xl md:text-4xl text-3xl font-bold text-foreground`
  - Line 145: Apply style to `<p>` tag: `text-base text-muted-foreground md:text-lg max-w-3xl mx-auto`
  - Line 151: Add `mt-12`

### RoomsShowcaseSection
**File:** `src/components/marketing/home/RoomsShowcaseSection.tsx`

- [x] **Layout and Styling Updates**
  - Line 158: In `<section>` tag, remove `py-20` and add `py-10 sm:py-12`
  - After line 159: Add new `<div>` with `className="space-y-4 text-center"` to contain the `<h2>` and `<p>` tags
  - For `<h2>` tag: Add `2xl:text-5xl md:text-4xl text-3xl font-bold text-foreground`
  - For `<p>` tag: Add `text-base text-muted-foreground md:text-lg max-w-3xl mx-auto`
  - Remove `mt-12` from `relative mt-12 lg:hidden`

### TestimonialSection
**File:** `src/components/marketing/home/TestimonialSection.tsx`

- [x] **Layout and Styling Updates**
  - Line 74: Replace `mb-16` with `mb-6 lg:mb-12` and add `space-y-4`
  - Line 80: In `<h2>` tag, add style: `2xl:text-5xl md:text-4xl text-3xl font-bold text-foreground`
  - Line 83: In `<p>` tag, add style: `text-base text-muted-foreground md:text-lg max-w-3xl mx-auto`

### BookPage
**File:** `src/app/(public)/book/page.tsx`

- [x] **Heading and Description Styling**
  - Line 74: In `<h1>` tag, apply style: `2xl:text-5xl md:text-4xl text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent`
  - Line 77: In `<p>` tag, apply style: `text-base text-muted-foreground md:text-lg max-w-lg lg:max-w-4xl mx-auto`

### AboutHeroSection
**File:** `src/components/marketing/about/about-hero-section.tsx`

- [x] **Heading Updates**
  - Line 47: Replace `<h1>` tag with `<h2>` tag
  - Wrap text after "A Trust for Service," to a new line

### AboutActivitiesSection
**File:** `src/components/marketing/about/about-activities-section.tsx`

- [x] **Max Width Update**
  - Line 81: Replace `max-w-4xl` with `max-w-3xl`

### PlacesToVisitSection
**File:** `src/components/marketing/about/places-to-visit-section.tsx`

- [x] **Max Width Update**
  - Line 70: Replace `max-w-4xl` with `max-w-xl`

### SunilBhagatUnifiedSection
**File:** `src/components/marketing/about/sunil-bhagat-unified-section.tsx`

- [ ] **Heading Text Wrap**
  - Line 117: Wrap text like this: `Swamiji Sunil Bhagat <br className="sm:hidden block"/> - Life & Service`

### SwamiSpeechSection
**File:** `src/components/marketing/about/swami-speech-section.tsx`

- [ ] **Heading Text Wrap**
  - Line 56: Wrap text like this: `Swamiji&apos;s Teachings & <br/> the Daily Ganga Aarti`

### RishikeshHeroSection
**File:** `src/components/marketing/about/rishikesh-hero-section.tsx`

- [ ] **Heading Updates**
  - Line 41: Change `<h1>` tag to `<h2>` tag
  - Line 42: Wrap text like this: `The Spiritual Gateway <br/> to the Himalayas`

### MapSection
**File:** `src/components/marketing/about/map-section.tsx`

- [ ] **Heading Text Wrap**
  - Line 21: Wrap text like this: `Find Us in Rishikesh <br/>SahajAnand Wellness`

### GalleryPageSection
**File:** `src/components/marketing/gallery/gallery-page-section.tsx`

- [ ] **Layout and Styling Updates**
  - Line 85: Remove `mb-12 sm:mb-16` and add `space-y-4`
  - Line 92: In `<h2>` tag, add heading style: `2xl:text-5xl md:text-4xl text-3xl font-bold text-foreground`
  - Line 94: In `<p>` tag, add style: `text-base text-muted-foreground md:text-lg max-w-xl mx-auto`
  - Remove lines 98 to 106
  - Line 109: Add `mt-12`

### ShopPage
**File:** `src/app/(public)/shop/page.tsx`

- [ ] **Heading Styling**
  - Line 89: In `<h1>` tag, apply style: `max-w-3xl 2xl:text-5xl md:text-4xl text-3xl font-bold`
