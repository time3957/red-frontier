/**
 * npcKnowledgeScope.js — Limits and defines what each NPC knows, suspects, does not know, can lie about, and Act-based restrictions.
 */

const NPC_KNOWLEDGE_SCOPE = {
  yara: {
    knows: ["aresium", "aresProtocol", "evans"],
    suspects: ["relay7", "isuComplicity"],
    doesNotKnow: ["aresium_ancient_hive_full", "relay7_agenda_full", "dmitri_memory"],
    canLieAbout: ["azrael_participation"],
    maxRevealLevelByAct: {
      aresium: { 1: "PARTIAL", 2: "PARTIAL", 3: "DEEP", 4: "DEEP" },
      relay7: { 1: "HINT", 2: "HINT", 3: "PARTIAL", 4: "PARTIAL" },
      isuComplicity: { 1: "HINT", 2: "PARTIAL", 3: "DEEP", 4: "DEEP" },
      aresProtocol: { 1: "HINT", 2: "PARTIAL", 3: "DEEP", 4: "DEEP" },
      evans: { 1: "PARTIAL", 2: "PARTIAL", 3: "DEEP", 4: "DEEP" },
      dmitri_memory: { 1: "NONE", 2: "NONE", 3: "NONE", 4: "NONE" }
    },
    forbiddenTopicsBeforeAct: {
      isuComplicity: 2,
      dmitri_memory: 4
    }
  },
  dmitri: {
    knows: ["relay7", "evans", "dmitri_memory"],
    suspects: ["aresium"],
    doesNotKnow: ["aresProtocol", "isuComplicity"],
    canLieAbout: [],
    // Capped by dmitriMemoriesUnlocked variable. Checked dynamically in revealControl.js.
    maxRevealLevelByAct: {
      aresium: { 1: "HINT", 2: "HINT", 3: "PARTIAL", 4: "PARTIAL" },
      relay7: { 1: "DEEP", 2: "DEEP", 3: "DEEP", 4: "FULL" },
      isuComplicity: { 1: "NONE", 2: "HINT", 3: "HINT", 4: "PARTIAL" },
      aresProtocol: { 1: "NONE", 2: "HINT", 3: "HINT", 4: "PARTIAL" },
      evans: { 1: "HINT", 2: "PARTIAL", 3: "DEEP", 4: "FULL" },
      dmitri_memory: { 1: "HINT", 2: "PARTIAL", 3: "DEEP", 4: "FULL" }
    },
    forbiddenTopicsBeforeAct: {
      aresProtocol: 2,
      isuComplicity: 2
    }
  },
  relay7_npc: {
    knows: ["aresium", "relay7", "aresProtocol", "isuComplicity", "evans", "dmitri_memory"],
    suspects: [],
    doesNotKnow: [],
    canLieAbout: ["conversion_safety"],
    maxRevealLevelByAct: {
      aresium: { 1: "HINT", 2: "PARTIAL", 3: "DEEP", 4: "FULL" },
      relay7: { 1: "HINT", 2: "PARTIAL", 3: "DEEP", 4: "FULL" },
      isuComplicity: { 1: "HINT", 2: "PARTIAL", 3: "DEEP", 4: "FULL" },
      aresProtocol: { 1: "HINT", 2: "PARTIAL", 3: "DEEP", 4: "FULL" },
      evans: { 1: "HINT", 2: "PARTIAL", 3: "DEEP", 4: "FULL" },
      dmitri_memory: { 1: "HINT", 2: "PARTIAL", 3: "DEEP", 4: "FULL" }
    },
    forbiddenTopicsBeforeAct: {}
  },
  isu_officer: {
    knows: ["isuComplicity"],
    suspects: ["aresProtocol", "evans"],
    doesNotKnow: ["aresium", "relay7", "dmitri_memory"],
    canLieAbout: ["purging_miners"],
    maxRevealLevelByAct: {
      aresium: { 1: "HINT", 2: "HINT", 3: "HINT", 4: "HINT" },
      relay7: { 1: "HINT", 2: "HINT", 3: "HINT", 4: "HINT" },
      isuComplicity: { 1: "HINT", 2: "HINT", 3: "PARTIAL", 4: "DEEP" },
      aresProtocol: { 1: "HINT", 2: "HINT", 3: "PARTIAL", 4: "DEEP" },
      evans: { 1: "NONE", 2: "HINT", 3: "PARTIAL", 4: "DEEP" },
      dmitri_memory: { 1: "NONE", 2: "NONE", 3: "NONE", 4: "NONE" }
    },
    forbiddenTopicsBeforeAct: {
      aresium: 3,
      relay7: 3,
      dmitri_memory: 4
    }
  },
  prometheus_agent: {
    knows: ["aresProtocol", "evans"],
    suspects: ["relay7"],
    doesNotKnow: ["aresium", "dmitri_memory"],
    canLieAbout: ["safety_measures"],
    maxRevealLevelByAct: {
      aresium: { 1: "NONE", 2: "NONE", 3: "HINT", 4: "HINT" },
      relay7: { 1: "HINT", 2: "HINT", 3: "PARTIAL", 4: "PARTIAL" },
      isuComplicity: { 1: "HINT", 2: "HINT", 3: "PARTIAL", 4: "DEEP" },
      aresProtocol: { 1: "HINT", 2: "PARTIAL", 3: "DEEP", 4: "FULL" },
      evans: { 1: "NONE", 2: "HINT", 3: "PARTIAL", 4: "DEEP" },
      dmitri_memory: { 1: "NONE", 2: "NONE", 3: "NONE", 4: "NONE" }
    },
    forbiddenTopicsBeforeAct: {
      aresium: 3,
      dmitri_memory: 4
    }
  },
  red_earth_contact: {
    knows: ["isuComplicity", "evans"],
    suspects: ["aresProtocol", "dmitri_memory"],
    doesNotKnow: ["aresium", "relay7"],
    canLieAbout: [],
    maxRevealLevelByAct: {
      aresium: { 1: "HINT", 2: "HINT", 3: "HINT", 4: "PARTIAL" },
      relay7: { 1: "HINT", 2: "HINT", 3: "HINT", 4: "PARTIAL" },
      isuComplicity: { 1: "HINT", 2: "PARTIAL", 3: "DEEP", 4: "DEEP" },
      aresProtocol: { 1: "HINT", 2: "PARTIAL", 3: "DEEP", 4: "DEEP" },
      evans: { 1: "HINT", 2: "PARTIAL", 3: "DEEP", 4: "DEEP" },
      dmitri_memory: { 1: "NONE", 2: "HINT", 3: "PARTIAL", 4: "DEEP" }
    },
    forbiddenTopicsBeforeAct: {}
  },
  forgotten_gatekeeper: {
    knows: [],
    suspects: ["aresium"],
    doesNotKnow: ["relay7", "aresProtocol", "isuComplicity", "evans", "dmitri_memory"],
    canLieAbout: [],
    maxRevealLevelByAct: {
      aresium: { 1: "HINT", 2: "HINT", 3: "HINT", 4: "HINT" },
      relay7: { 1: "NONE", 2: "NONE", 3: "NONE", 4: "NONE" },
      isuComplicity: { 1: "NONE", 2: "NONE", 3: "NONE", 4: "NONE" },
      aresProtocol: { 1: "NONE", 2: "NONE", 3: "NONE", 4: "NONE" },
      evans: { 1: "NONE", 2: "NONE", 3: "NONE", 4: "NONE" },
      dmitri_memory: { 1: "NONE", 2: "NONE", 3: "NONE", 4: "NONE" }
    },
    forbiddenTopicsBeforeAct: {
      relay7: 4,
      aresProtocol: 4,
      isuComplicity: 4,
      evans: 4,
      dmitri_memory: 4
    }
  }
};

module.exports = {
  NPC_KNOWLEDGE_SCOPE
};
