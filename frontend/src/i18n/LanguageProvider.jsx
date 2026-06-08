import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { translations } from "./translations";

const LanguageContext = createContext(null);
const originalText = new WeakMap();
const translatedText = new WeakMap();
const originalAttributes = new WeakMap();
const translatedAttributes = new WeakMap();
const reverseTranslations = Object.fromEntries(
  Object.entries(translations).map(([english, french]) => [french, english])
);

const normalize = (value) => String(value || "").replace(/\s+/g, " ").trim();
const fold = (value) =>
  normalize(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u2019]/g, "'")
    .toLowerCase();

const reverseFoldedTranslations = Object.fromEntries(
  Object.entries(translations).map(([english, french]) => [fold(french), english])
);

const frenchTermReplacements = [
  [/\bm\u00e9moire final\b/gi, "final report"],
  [/\brapport final\b/gi, "final report"],
  [/\bIng\u00e9nieur\b/g, "Engineer"],
  [/\bing\u00e9nieur\b/g, "engineer"],
  [/\b\u00c9t\u00e9\b/g, "Summer internship"],
  [/\b\u00e9t\u00e9\b/g, "summer internship"],
  [/\bEncadrants\b/g, "Supervisors"],
  [/\bencadrants\b/g, "supervisors"],
  [/\bEncadrant\b/g, "Supervisor"],
  [/\bencadrant\b/g, "supervisor"],
  [/\bStagiaires\b/g, "Interns"],
  [/\bstagiaires\b/g, "interns"],
  [/\bStagiaire\b/g, "Intern"],
  [/\bstagiaire\b/g, "intern"],
  [/\bAffectations\b/g, "Assignments"],
  [/\baffectations\b/g, "assignments"],
  [/\bAffectation\b/g, "Assignment"],
  [/\baffectation\b/g, "assignment"],
  [/\bCandidatures\b/g, "Applications"],
  [/\bcandidatures\b/g, "applications"],
  [/\bCandidature\b/g, "Application"],
  [/\bcandidature\b/g, "application"],
  [/\bBin\u00f4mes\b/g, "Teams"],
  [/\bbin\u00f4mes\b/g, "teams"],
  [/\bBin\u00f4me\b/g, "Team"],
  [/\bbin\u00f4me\b/g, "team"],
  [/\bSujets\b/g, "Subjects"],
  [/\bsujets\b/g, "subjects"],
  [/\bSujet\b/g, "Subject"],
  [/\bsujet\b/g, "subject"],
  [/\bRapports\b/g, "Reports"],
  [/\brapports\b/g, "reports"],
  [/\bRapport\b/g, "Report"],
  [/\brapport\b/g, "report"],
];

const replaceFrenchTermsInEnglish = (value) => {
  let translated = value;

  frenchTermReplacements.forEach(([pattern, replacement]) => {
    translated = translated.replace(pattern, replacement);
  });

  translated = translated.replace(/\bPFE\b/g, (match, offset, fullText) => {
    const prefix = fullText.slice(Math.max(0, offset - 20), offset);
    return prefix.endsWith("Final-year project (")
      ? match
      : "Final-year project (PFE)";
  });

  return translated;
};

const translateText = (value, language) => {
  const leading = String(value).match(/^\s*/)?.[0] || "";
  const trailing = String(value).match(/\s*$/)?.[0] || "";
  const clean = normalize(value);

  if (!clean) return value;

  if (language === "EN") {
    if (reverseTranslations[clean]) {
      return `${leading}${reverseTranslations[clean]}${trailing}`;
    }

    const foldedTranslation = reverseFoldedTranslations[fold(clean)];
    if (foldedTranslation) return `${leading}${foldedTranslation}${trailing}`;

    const frenchWelcomeMatch = clean.match(
      /^Bienvenue, (.+)\. Voici un aper\u00e7u de votre espace(?: encadrant)?\.$/
    );
    if (frenchWelcomeMatch) {
      const suffix = fold(clean).includes("espace encadrant")
        ? "supervisor space"
        : "space";
      return `${leading}Welcome, ${frenchWelcomeMatch[1]}. Here is an overview of your ${suffix}.${trailing}`;
    }

    const frenchCreatedOnMatch = clean.match(/^Cr\u00e9\u00e9 le (.+)$/);
    if (frenchCreatedOnMatch) {
      return `${leading}Created on ${frenchCreatedOnMatch[1]}${trailing}`;
    }

    const frenchAssignedOnMatch = clean.match(/^Affect\u00e9 le (.+)$/);
    if (frenchAssignedOnMatch) {
      return `${leading}Assigned on ${frenchAssignedOnMatch[1]}${trailing}`;
    }

    const folded = fold(clean);
    const notificationPatterns = [
      {
        pattern: /^(.+) vous a envoye une invitation binome\.$/,
        build: (match) => `${match[1]} sent you a team invitation.`,
      },
      {
        pattern: /^(.+) a accepte votre invitation binome\.$/,
        build: (match) => `${match[1]} accepted your team invitation.`,
      },
      {
        pattern: /^(.+) a refuse votre invitation binome\.$/,
        build: (match) => `${match[1]} rejected your team invitation.`,
      },
      {
        pattern: /^votre candidature (?:au |pour le |pour )?sujet "(.+)" a ete acceptee\.?$/,
        build: (match) => `Your application for "${match[1]}" was accepted.`,
      },
      {
        pattern: /^votre candidature (?:au |pour le |pour )?sujet "(.+)" a ete refusee\.?$/,
        build: (match) => `Your application for "${match[1]}" was rejected.`,
      },
      {
        pattern:
          /^votre candidature (?:au |pour le |pour )?sujet "(.+)" a ete refusee car un etudiant de votre faculte travaille deja sur ce sujet\.$/,
        build: (match) =>
          `Your application for "${match[1]}" was rejected because someone from your faculty is already working on this subject.`,
      },
      {
        pattern: /^votre entretien pour (?:le )?sujet "(.+)" a ete planifie\.$/,
        build: (match) => `Your interview for "${match[1]}" has been scheduled.`,
      },
      {
        pattern: /^une nouvelle candidature(?: en binome)? a ete recue pour le sujet "(.+)"\.$/,
        build: (match) => `A new application was received for "${match[1]}".`,
      },
      {
        pattern: /^(.+) vous a envoye un message\.$/,
        build: (match) => `${match[1]} sent you a message.`,
      },
      {
        pattern: /^(.+) a demande un acces encadrant\.$/,
        build: (match) => `${match[1]} requested supervisor access.`,
      },
    ];

    for (const item of notificationPatterns) {
      const match = folded.match(item.pattern);
      if (match) return `${leading}${item.build(match)}${trailing}`;
    }

    const termTranslated = replaceFrenchTermsInEnglish(clean);
    if (termTranslated !== clean) return `${leading}${termTranslated}${trailing}`;

    return value;
  }

  if (translations[clean]) return `${leading}${translations[clean]}${trailing}`;

  const welcomeMatch = clean.match(
    /^Welcome, (.+)\. Here is an overview of your space\.$/
  );
  if (welcomeMatch) {
    return `${leading}Bienvenue, ${welcomeMatch[1]}. Voici un aper\u00e7u de votre espace.${trailing}`;
  }

  const supervisorWelcomeMatch = clean.match(
    /^Welcome, (.+)\. Here is an overview of your supervisor space\.$/
  );
  if (supervisorWelcomeMatch) {
    return `${leading}Bienvenue, ${supervisorWelcomeMatch[1]}. Voici un aper\u00e7u de votre espace encadrant.${trailing}`;
  }

  const createdOnMatch = clean.match(/^Created on (.+)$/);
  if (createdOnMatch) {
    return `${leading}Cr\u00e9\u00e9 le ${createdOnMatch[1]}${trailing}`;
  }

  const assignedOnMatch = clean.match(/^Assigned on (.+)$/);
  if (assignedOnMatch) {
    return `${leading}Affect\u00e9 le ${assignedOnMatch[1]}${trailing}`;
  }

  const supervisorMatch = clean.match(/^Supervisor : (.+)$/);
  if (supervisorMatch) {
    return `${leading}Encadrant : ${supervisorMatch[1]}${trailing}`;
  }

  return value;
};

const translateDom = (root, language) => {
  if (!root) return;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!normalize(node.nodeValue)) return NodeFilter.FILTER_REJECT;

      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (parent.closest("[data-no-translate]")) return NodeFilter.FILTER_REJECT;
      if (["SCRIPT", "STYLE", "TEXTAREA", "INPUT"].includes(parent.tagName)) {
        return NodeFilter.FILTER_REJECT;
      }

      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);

  textNodes.forEach((node) => {
    const lastTranslated = translatedText.get(node);
    const reactUpdatedNode =
      lastTranslated !== undefined && node.nodeValue !== lastTranslated;

    if (!originalText.has(node) || reactUpdatedNode) {
      originalText.set(node, node.nodeValue);
    }

    const english = originalText.get(node);
    const translated = translateText(english, language);
    translatedText.set(node, translated);

    if (node.nodeValue !== translated) {
      node.nodeValue = translated;
    }
  });

  root
    .querySelectorAll?.("[placeholder], [title], [aria-label]")
    .forEach((element) => {
      if (element.closest("[data-no-translate]")) return;

      ["placeholder", "title", "aria-label"].forEach((attribute) => {
        if (!element.hasAttribute(attribute)) return;

        let stored = originalAttributes.get(element);
        if (!stored) {
          stored = {};
          originalAttributes.set(element, stored);
        }

        let lastTranslated = translatedAttributes.get(element);
        if (!lastTranslated) {
          lastTranslated = {};
          translatedAttributes.set(element, lastTranslated);
        }

        const currentValue = element.getAttribute(attribute);
        const reactUpdatedAttribute =
          lastTranslated[attribute] !== undefined &&
          currentValue !== lastTranslated[attribute];

        if (!stored[attribute] || reactUpdatedAttribute) {
          stored[attribute] = currentValue;
        }

        const translated = translateText(stored[attribute], language);
        lastTranslated[attribute] = translated;

        if (currentValue !== translated) {
          element.setAttribute(attribute, translated);
        }
      });
    });
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(
    () => localStorage.getItem("language") || "EN"
  );

  useEffect(() => {
    localStorage.setItem("language", language);
    document.documentElement.lang = language === "FR" ? "fr" : "en";
    document.documentElement.setAttribute("data-language", language);
  }, [language]);

  useEffect(() => {
    translateDom(document.body, language);

    const observer = new MutationObserver(() => {
      translateDom(document.body, language);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["placeholder", "title", "aria-label"],
    });

    return () => observer.disconnect();
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage: () =>
        setLanguage((current) => (current === "FR" ? "EN" : "FR")),
    }),
    [language]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  return context;
};
