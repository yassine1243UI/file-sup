import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from "../../components/Button/Button";
import "./Homepage.css"

const cardsData = [
  {
    title: 'Sécurité de vos données',
    text: 'Vos fichiers sont protégés par des protocoles de cryptage avancés, assurant une sécurité maximale à chaque étape, de la transmission au stockage.',
    icon: '/images/icons/lock_icon.png',
  },
  {
    title: 'Simplicité d\'utilisation',
    text: 'Une interface intuitive vous permet de gérer et organiser vos documents en quelques clics, sans nécessiter de compétences techniques.',
    icon: '/images/icons/mouse_icon.png',
  },
  {
    title: 'Collaboration efficace',
    text: 'Les espaces de stockage partagés facilitent la collaboration en permettant à chaque membre de l\'équipe d\'accéder et de modifier les fichiers en temps réel.',
    icon: '/images/icons/handshake_icon.png',
  },
  {
    title: 'Suivi et statistiques détaillés',
    text: 'Des outils de suivi offrent une visibilité complète sur l\'utilisation de l\'espace de stockage, avec des statistiques pour optimiser la gestion de vos documents.',
    icon: '/images/icons/stats_icon.png',
  },
];

const faqs = [
  {
    id: 'answer-1',
    question: 'Quels types de plans de stockage proposez-vous ?',
    answer: 'Nous proposons des plans adaptés aux particuliers et aux entreprises, avec différentes capacités de stockage.',
  },
  {
    id: 'answer-2',
    question: 'Comment Filesup garantit-il la sécurité de mes fichiers ?',
    answer: 'Nous utilisons des protocoles de cryptage avancés et des systèmes de sécurité renforcés.',
  },
  {
    id: 'answer-3',
    question: 'Est-il possible de partager des fichiers avec mes collègues ?',
    answer: 'Oui, Filesup offre des fonctionnalités de partage et de collaboration en temps réel.',
  },
  {
    id: 'answer-4',
    question: 'Quels outils de suivi sont disponibles ?',
    answer: 'Filesup propose des tableaux de bord détaillés avec des statistiques d\'utilisation.',
  },
];

export default function Homepage() {
  const [activeId, setActiveId] = useState(null);
  const navigate = useNavigate();

  const toggleAnswer = (id) => {
    setActiveId(activeId === id ? null : id);
  };

  return (
    <div className="homepage">
      <div className="header-section">
        <div className="header-content text-center">
          <h1 className="text-5xl font-bold text-white"> 📂 Bienvenue sur Filesup</h1>
          <p className="text-xl text-gray-200 mt-4">
            La solution complète pour stocker, partager et sécuriser vos fichiers en toute simplicité.
          </p>
          <div className="button-group mt-6 flex justify-center space-x-4">
    <Button
      css="px-6 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 focus:outline-none transition-transform transform hover:translate-y-[-3px]"
      onClick={() => navigate('/signup')}
    >
      Découvrir maintenant
    </Button>
    <Button
      css="px-6 py-3 bg-gray-100 text-blue-700 border border-blue-700 rounded-lg hover:bg-blue-50 focus:outline-none transition-transform transform hover:translate-y-[-3px]"
      onClick={() => navigate('/login')}
    >
      Se connecter
    </Button>
  </div>
        </div>
        <img
          src="/images/bg-homepage.png"
          alt="Illustration Filesup"
          className="header-image"
        />
      </div>

      <div className="why-section">
        <h2 className="section-title">Pourquoi utiliser Filesup ?</h2>
        <div className="cards-container">
          {cardsData.map((card, index) => (
            <div
              key={index}
              className="card-item"
            >
              <img
                src={card.icon}
                alt={`Icône ${card.title}`}
                className="card-icon"
              />
              <h3 className="card-title">{card.title}</h3>
              <p className="card-text">{card.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="faq-section">
        <h2 className="section-title">En savoir plus</h2>
        <div className="faq-container">
          {faqs.map(({ id, question, answer }) => (
            <div key={id} className="faq-item">
              <button
                className="faq-question"
                onClick={() => toggleAnswer(id)}
              >
                <span>{question}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`faq-icon ${activeId === id ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {activeId === id && (
                <p className="faq-answer">{answer}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
