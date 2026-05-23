/**
 * npcKnowledgeScope.js — Limits and defines what each NPC knows, suspects, does not know, can lie about, and Act-based restrictions.
 */

const NPC_KNOWLEDGE_SCOPE = {
  yara: {
    knows: ["aresium", "aresProtocol"],
    suspects: ["relay7", "isuComplicity"],
    doesNotKnow: ["aresium_ancient_hive_full", "relay7_agenda_full"],
    canLieAbout: ["azrael_participation"],
    maxRevealLevelByAct: {
      aresium: { 1: "PARTIAL", 2: "PARTIAL", 3: "DEEP", 4: "DEEP" },
      relay7: { 1: "HINT", 2: "HINT", 3: "PARTIAL", 4: "PARTIAL" },
      isuComplicity: { 1: "HINT", 2: "PARTIAL", 3: "DEEP", 4: "DEEP" },
      aresProtocol: { 1: "HINT", 2: "PARTIAL", 3: "DEEP", 4: "DEEP" }
    },
    forbiddenTopicsBeforeAct: {
      isuComplicity: 2
    }
  },
  dmitri: {
    knows: ["relay7"],
    suspects: ["aresium"],
    doesNotKnow: ["aresProtocol", "isuComplicity"],
    canLieAbout: [],
    // Capped by dmitriMemoriesUnlocked variable. Checked dynamically in revealControl.js.
    maxRevealLevelByAct: {
      aresium: { 1: "HINT", 2: "HINT", 3: "PARTIAL", 4: "PARTIAL" },
      relay7: { 1: "DEEP", 2: "DEEP", 3: "DEEP", 4: "FULL" },
      isuComplicity: { 1: "NONE", 2: "HINT", 3: "HINT", 4: "PARTIAL" },
      aresProtocol: { 1: "NONE", 2: "HINT", 3: "HINT", 4: "PARTIAL" }
    },
    forbiddenTopicsBeforeAct: {
      aresProtocol: 2,
      isuComplicity: 2
    }
  },
  relay7_npc: {
    knows: ["aresium", "relay7", "aresProtocol", "isuComplicity"],
    suspects: [],
    doesNotKnow: [],
    canLieAbout: ["conversion_safety"],
    maxRevealLevelByAct: {
      aresium: { 1: "HINT", 2: "PARTIAL", 3: "DEEP", 4: "FULL" },
      relay7: { 1: "HINT", 2: "PARTIAL", 3: "DEEP", 4: "FULL" },
      isuComplicity: { 1: "HINT", 2: "PARTIAL", 3: "DEEP", 4: "FULL" },
      aresProtocol: { 1: "HINT", 2: "PARTIAL", 3: "DEEP", 4: "FULL" }
    },
    forbiddenTopicsBeforeAct: {}
  },
  isu_officer: {
    knows: ["isuComplicity"],
    suspects: ["aresProtocol"],
    doesNotKnow: ["aresium", "relay7"],
    canLieAbout: ["purging_miners"],
    maxRevealLevelByAct: {
      aresium: { 1: "HINT", 2: "HINT", 3: "HINT", 4: "HINT" },
      relay7: { 1: "HINT", 2: "HINT", 3: "HINT", 4: "HINT" },
      isuComplicity: { 1: "HINT", 2: "HINT", 3: "PARTIAL", 4: "DEEP" },
      aresProtocol: { 1: "HINT", 2: "HINT", 3: "PARTIAL", 4: "DEEP" }
    },
    forbiddenTopicsBeforeAct: {
      aresium: 3,
      relay7: 3
    }
  },
  prometheus_agent: {
    knows: ["aresProtocol"],
    suspects: ["relay7"],
    doesNotKnow: ["aresium"],
    canLieAbout: ["safety_measures"],
    maxRevealLevelByAct: {
      aresium: { 1: "NONE", 2: "NONE", 3: "HINT", 4: "HINT" },
      relay7: { 1: "HINT", 2: "HINT", 3: "PARTIAL", 4: "PARTIAL" },
      isuComplicity: { 1: "HINT", 2: "HINT", 3: "PARTIAL", 4: "DEEP" },
      aresProtocol: { 1: "HINT", 2: "PARTIAL", 3: "DEEP", 4: "FULL" }
    },
    forbiddenTopicsBeforeAct: {
      aresium: 3
    }
  },
  red_earth_contact: {
    knows: ["isuComplicity"],
    suspects: ["aresProtocol"],
    doesNotKnow: ["aresium", "relay7"],
    canLieAbout: [],
    maxRevealLevelByAct: {
      aresium: { 1: "HINT", 2: "HINT", 3: "HINT", 4: "PARTIAL" },
      relay7: { 1: "HINT", 2: "HINT", 3: "HINT", 4: "PARTIAL" },
      isuComplicity: { 1: "HINT", 2: "PARTIAL", 3: "DEEP", 4: "DEEP" },
      aresProtocol: { 1: "HINT", 2: "PARTIAL", 3: "DEEP", 4: "DEEP" }
    },
    forbiddenTopicsBeforeAct: {}
  },
  forgotten_gatekeeper: {
    knows: [],
    suspects: ["aresium"],
    doesNotKnow: ["relay7", "aresProtocol", "isuComplicity"],
    canLieAbout: [],
    maxRevealLevelByAct: {
      aresium: { 1: "HINT", 2: "HINT", 3: "HINT", 4: "HINT" },
      relay7: { 1: "NONE", 2: "NONE", 3: "NONE", 4: "NONE" },
      isuComplicity: { 1: "NONE", 2: "NONE", 3: "NONE", 4: "NONE" },
      aresProtocol: { 1: "NONE", 2: "NONE", 3: "NONE", 4: "NONE" }
    },
    forbiddenTopicsBeforeAct: {
      relay7: 4,
      aresProtocol: 4,
      isuComplicity: 4
    }
  }
};

module.exports = {
  NPC_KNOWLEDGE_SCOPE
};
