import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";

// Interface for form errors to provide strong typing.
interface FormErrors {
  name?: string;
  email?: string;
  address?: string;
  city?: string;
  zip?: string;
  cardName?: string;
  cardNumber?: string;
  expiry?: string;
  cvc?: string;
  verificationCode?: string;
}

// --- Sub-components for better organization ---

const Header = () => (
  <header>
    <div className="container">
      <a href="#" className="logo">Web.Br</a>
      <nav>
        <a href="#">Domínios</a>
        <a href="#">Criação de Sites</a>
        <a href="#">Contato</a>
      </nav>
    </div>
  </header>
);

const Hero = ({ searchTerm, setSearchTerm, handleFormSubmit, isLoading }) => (
  <section className="hero">
    <div className="container">
      <h1>Encontre o domínio perfeito para o seu negócio</h1>
      <p>Comece sua jornada online com um nome de domínio memorável. A identidade do seu sucesso começa aqui.</p>
      <form className="search-form" onSubmit={handleFormSubmit}>
        <input
          type="text"
          className="search-input"
          placeholder="digite o domínio que você deseja.com.br"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Pesquisar domínio"
        />
        <button type="submit" className="search-button" disabled={isLoading || !searchTerm}>
          {isLoading ? '...' : 'Pesquisar'}
        </button>
      </form>
    </div>
  </section>
);

const Results = ({ isLoading, error, searchResult, suggestions, handleRegisterClick, handleSuggestionClick }) => (
  <section className="results-section container">
    {isLoading && <div className="loading-spinner"></div>}
    {error && <p className="status-taken">{error}</p>}
    
    {searchResult && (
      <div className={`result-card ${searchResult.available ? 'result-card-available' : 'result-card-taken'}`}>
        <h3>Resultado para <span className="domain-name">{searchResult.domain}</span></h3>
        {searchResult.available ? (
          <div className="result-content">
              <p>
                  <span className="status status-available">Parabéns, este domínio está disponível!</span>
              </p>
              <div>
                  <span className="price">R${searchResult.price}/ano</span>
                  <button className="register-button" onClick={() => handleRegisterClick(searchResult.domain, searchResult.price)}>Registrar Agora</button>
              </div>
          </div>
        ) : (
          <p>
              <span className="status status-taken">Este domínio já está em uso.</span> Que tal uma destas sugestões?
          </p>
        )}
      </div>
    )}

    {!isLoading && suggestions.length > 0 && (
      <div className="suggestions">
        <div className="suggestion-list">
          {suggestions.map((domain, index) => (
            <div key={index} className="suggestion-item" onClick={() => handleSuggestionClick(domain)} tabIndex={0} role="button">
              {domain}
            </div>
          ))}
        </div>
      </div>
    )}
  </section>
);

const Contact = ({ contactEmail, handleContactEmailChange, handleContactSubmit, emailError, formMessage }) => (
  <section className="contact-section">
      <div className="container">
          <h2>Precisando de um site profissional?</h2>
          <p>Além do domínio, criamos sites modernos, rápidos e otimizados. Deixe seu e-mail para receber um orçamento sem compromisso.</p>
          <form className="contact-form" onSubmit={handleContactSubmit}>
              <input 
                  type="email" 
                  className="contact-input" 
                  placeholder="seu-melhor-email@exemplo.com"
                  value={contactEmail}
                  onChange={handleContactEmailChange}
                  aria-label="Email para orçamento"
                  required
              />
              <button type="submit" className="cta-button">Pedir Orçamento</button>
          </form>
          {emailError && <p className="email-error-message">{emailError}</p>}
          {formMessage && <p className="form-success-message">{formMessage}</p>}
      </div>
  </section>
);

const Footer = () => (
    <footer>
        <div className="container">
            <p>&copy; {new Date().getFullYear()} Web.Br. Todos os direitos reservados.</p>
        </div>
    </footer>
);

// --- Checkout Modal and its Steps ---

const CheckoutStep1 = ({ customerDetails, handleCustomerDetailsChange, formErrors }) => (
    <div className="checkout-step">
      <div className="checkout-form-group">
          <label htmlFor="name">Nome Completo</label>
          <input type="text" id="name" name="name" value={customerDetails.name} onChange={handleCustomerDetailsChange} />
          {formErrors.name && <p className="checkout-error">{formErrors.name}</p>}
      </div>
      <div className="checkout-form-group">
          <label htmlFor="email">E-mail</label>
          <input type="email" id="email" name="email" value={customerDetails.email} onChange={handleCustomerDetailsChange} />
          {formErrors.email && <p className="checkout-error">{formErrors.email}</p>}
      </div>
      <div className="checkout-form-group">
          <label htmlFor="address">Endereço</label>
          <input type="text" id="address" name="address" value={customerDetails.address} onChange={handleCustomerDetailsChange} />
          {formErrors.address && <p className="checkout-error">{formErrors.address}</p>}
      </div>
      <div className="checkout-form-group">
          <label htmlFor="city">Cidade</label>
          <input type="text" id="city" name="city" value={customerDetails.city} onChange={handleCustomerDetailsChange} />
          {formErrors.city && <p className="checkout-error">{formErrors.city}</p>}
      </div>
      <div className="checkout-form-group">
          <label htmlFor="zip">CEP</label>
          <input type="text" id="zip" name="zip" value={customerDetails.zip} onChange={handleCustomerDetailsChange} placeholder="00000-000" maxLength={9} />
          {formErrors.zip && <p className="checkout-error">{formErrors.zip}</p>}
      </div>
    </div>
);

const CheckoutStep2VerifyEmail = ({ email, verificationInput, handleVerificationInputChange, formErrors, handleResendCode, resendTimer }) => (
    <div className="checkout-step">
        <p className="verification-info">Enviamos um código de verificação para <strong>{email}</strong>. Por favor, insira-o abaixo. (Verifique o console do navegador para o código de teste).</p>
        <div className="checkout-form-group">
            <label htmlFor="verificationCode">Código de Verificação</label>
            <input type="text" id="verificationCode" name="verificationCode" value={verificationInput} onChange={handleVerificationInputChange} placeholder="_ _ _ _ _ _" maxLength={6} />
            {formErrors.verificationCode && <p className="checkout-error">{formErrors.verificationCode}</p>}
        </div>
        <div className="resend-container">
            <button onClick={handleResendCode} disabled={resendTimer > 0} className="resend-button">
                {resendTimer > 0 ? `Aguarde ${resendTimer}s para reenviar` : 'Reenviar Código'}
            </button>
        </div>
    </div>
);

const CheckoutStep3 = ({ paymentDetails, handlePaymentDetailsChange, formErrors }) => (
    <div className="checkout-step">
      <div className="checkout-form-group">
          <label htmlFor="cardName">Nome no Cartão</label>
          <input type="text" id="cardName" name="cardName" value={paymentDetails.cardName} onChange={handlePaymentDetailsChange} />
          {formErrors.cardName && <p className="checkout-error">{formErrors.cardName}</p>}
      </div>
      <div className="checkout-form-group">
          <label htmlFor="cardNumber">Número do Cartão</label>
          <input type="tel" id="cardNumber" name="cardNumber" value={paymentDetails.cardNumber} onChange={handlePaymentDetailsChange} placeholder="0000 0000 0000 0000" maxLength="19" inputMode="numeric" />
          {formErrors.cardNumber && <p className="checkout-error">{formErrors.cardNumber}</p>}
      </div>
      <div className="checkout-form-group-inline">
          <div className="checkout-form-group">
              <label htmlFor="expiry">Validade</label>
              <input type="tel" id="expiry" name="expiry" value={paymentDetails.expiry} onChange={handlePaymentDetailsChange} placeholder="MM/AA" maxLength="5" inputMode="numeric" />
              {formErrors.expiry && <p className="checkout-error">{formErrors.expiry}</p>}
          </div>
          <div className="checkout-form-group">
              <label htmlFor="cvc">CVC</label>
              <input type="tel" id="cvc" name="cvc" value={paymentDetails.cvc} onChange={handlePaymentDetailsChange} placeholder="123" maxLength="4" inputMode="numeric" />
              {formErrors.cvc && <p className="checkout-error">{formErrors.cvc}</p>}
          </div>
      </div>
    </div>
);

const CheckoutStep4 = ({ cart, customerDetails }) => (
    <div className="checkout-step checkout-summary">
      <h4>Resumo do Pedido</h4>
      <div className="summary-item"><span>Domínio:</span> <strong>{cart.domain}</strong></div>
      <div className="summary-item"><span>Preço:</span> <strong>R${cart.price}/ano</strong></div>
      <hr />
      <h4>Detalhes do Cliente</h4>
      <div className="summary-item"><span>Nome:</span> {customerDetails.name}</div>
      <div className="summary-item"><span>E-mail:</span> {customerDetails.email}</div>
      <div className="summary-item"><span>Endereço:</span> {customerDetails.address}, {customerDetails.city} - {customerDetails.zip}</div>
    </div>
);

const CheckoutStep5 = ({ cart, customerDetails, handleCancelCheckout }) => (
    <div className="checkout-step checkout-success">
      <div className="success-animation-container">
          <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
              <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
              <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
          </svg>
      </div>
      <h3 className="success-message-fade-in">Pagamento Aprovado!</h3>
      <p className="success-message-fade-in">Parabéns! O domínio <strong>{cart.domain}</strong> foi registrado com sucesso.</p>
      <p className="success-message-fade-in">Enviamos todos os detalhes para o seu e-mail: {customerDetails.email}</p>
      <button className="cta-button success-message-fade-in" onClick={handleCancelCheckout}>Voltar ao Início</button>
    </div>
);


const CheckoutModal = ({
    isCheckoutActive, checkoutStep, isLoading, cart,
    customerDetails, paymentDetails, formErrors,
    verificationInput, resendTimer,
    handleCancelCheckout, handleCustomerDetailsChange,
    handlePaymentDetailsChange, handlePrevStep, handleNextStep,
    handleConfirmPurchase, handleVerificationInputChange, handleResendCode
}) => {
    if (!isCheckoutActive) return null;

    const stepTitles = ["", "1. Detalhes de Contato", "2. Verificação de E-mail", "3. Informações de Pagamento", "4. Revisão do Pedido", ""];

    return (
        <div className="checkout-modal-overlay">
            <div className="checkout-modal-content">
                <div className="checkout-header">
                    <h2>{stepTitles[checkoutStep]}</h2>
                    {checkoutStep < 5 && <button className="close-btn" onClick={handleCancelCheckout}>&times;</button>}
                </div>

                {isLoading && <div className="loading-spinner"></div>}

                {!isLoading && checkoutStep === 1 && (
                  <CheckoutStep1 
                    customerDetails={customerDetails}
                    handleCustomerDetailsChange={handleCustomerDetailsChange}
                    formErrors={formErrors}
                  />
                )}

                {!isLoading && checkoutStep === 2 && (
                    <CheckoutStep2VerifyEmail
                        email={customerDetails.email}
                        verificationInput={verificationInput}
                        handleVerificationInputChange={handleVerificationInputChange}
                        formErrors={formErrors}
                        handleResendCode={handleResendCode}
                        resendTimer={resendTimer}
                    />
                )}
                
                {!isLoading && checkoutStep === 3 && (
                   <CheckoutStep3
                    paymentDetails={paymentDetails}
                    handlePaymentDetailsChange={handlePaymentDetailsChange}
                    formErrors={formErrors}
                  />
                )}

                {!isLoading && checkoutStep === 4 && (
                    <CheckoutStep4 cart={cart} customerDetails={customerDetails} />
                )}
                
                {!isLoading && checkoutStep === 5 && (
                    <CheckoutStep5 cart={cart} customerDetails={customerDetails} handleCancelCheckout={handleCancelCheckout} />
                )}

                {!isLoading && checkoutStep < 5 && (
                    <div className="checkout-nav">
                        {checkoutStep > 1 && <button className="secondary-button" onClick={handlePrevStep}>Voltar</button>}
                        {checkoutStep < 4 && <button className="cta-button" onClick={handleNextStep}>
                            {checkoutStep === 2 ? 'Verificar e Continuar' : 'Avançar'}
                        </button>}
                        {checkoutStep === 4 && <button className="cta-button" onClick={handleConfirmPurchase}>Confirmar Compra</button>}
                    </div>
                )}
            </div>
        </div>
    );
};


// --- Main App Component ---

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [formMessage, setFormMessage] = useState('');

  // Checkout state
  const [isCheckoutActive, setIsCheckoutActive] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [cart, setCart] = useState(null);
  const [customerDetails, setCustomerDetails] = useState({ name: '', email: '', address: '', city: '', zip: '' });
  const [paymentDetails, setPaymentDetails] = useState({ cardName: '', cardNumber: '', expiry: '', cvc: '' });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  
  // Email verification state
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationInput, setVerificationInput] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const timerRef = useRef(null);

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  useEffect(() => {
    const savedCart = localStorage.getItem('domainCart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
      setIsCheckoutActive(true);
      setCheckoutStep(1);
    }
    const savedEmail = localStorage.getItem('userContactEmail');
    if (savedEmail) {
      setContactEmail(savedEmail);
    }
  }, []);
  
  useEffect(() => {
    if (resendTimer > 0) {
      timerRef.current = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    } else {
      clearTimeout(timerRef.current);
    }
    return () => clearTimeout(timerRef.current);
  }, [resendTimer]);


  const handleSearch = async (domainToSearch) => {
    if (!domainToSearch) return;

    setIsLoading(true);
    setSearchResult(null);
    setSuggestions([]);
    setError('');

    await new Promise(resolve => setTimeout(resolve, 500));
    
    const isAvailable = !domainToSearch.toLowerCase().includes('indisponivel');

    if (isAvailable) {
      setSearchResult({ domain: domainToSearch, available: true, price: '49,99' });
      setIsLoading(false);
    } else {
      setSearchResult({ domain: domainToSearch, available: false });
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Gere 8 nomes de domínio alternativos e criativos para "${domainToSearch}". Os domínios devem ser curtos, memoráveis e adequados para negócios digitais. Inclua uma variedade de extensões como .com, .com.br, .net, .org, e .io. Considere adicionar palavras-chave relevantes como 'digital', 'online', 'tech', 'hub', 'solution'.`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: { domains: { type: Type.ARRAY, items: { type: Type.STRING } } }
            },
          },
        });
        
        const jsonText = response.text.trim();
        const generated = JSON.parse(jsonText);

        if (generated.domains && generated.domains.length > 0) {
          setSuggestions(generated.domains);
        } else {
          setError('Não foi possível gerar sugestões no momento.');
        }
      } catch (err) {
        console.error("Error generating suggestions:", err);
        setError('Ocorreu um erro ao buscar sugestões. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const handleFormSubmit = (e) => {
      e.preventDefault();
      handleSearch(searchTerm);
  };

  const handleSuggestionClick = (domain) => {
    setSearchTerm(domain);
    handleSearch(domain);
  };
  
  const validateEmail = (email) => {
      const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
  };
  
  const handleContactEmailChange = (e) => {
    const email = e.target.value;
    setContactEmail(email);
    localStorage.setItem('userContactEmail', email);
  };

  const handleContactSubmit = (e) => {
      e.preventDefault();
      setEmailError('');
      setFormMessage('');

      if (!validateEmail(contactEmail)) {
        setEmailError('Por favor, insira um e-mail válido.');
        return;
      }
      
      console.log('Email submitted for quote:', contactEmail);
      setFormMessage('Obrigado pelo seu interesse! Entraremos em contato em breve.');
      setContactEmail('');
  };

  // --- Checkout Handlers ---
  const handleRegisterClick = (domain, price) => {
      const cartItem = { domain, price };
      localStorage.setItem('domainCart', JSON.stringify(cartItem));
      setCart(cartItem);
      setIsCheckoutActive(true);
      setCheckoutStep(1);
  };
  
  const handleCancelCheckout = () => {
    localStorage.removeItem('domainCart');
    setCart(null);
    setIsCheckoutActive(false);
    setCheckoutStep(1);
    setCustomerDetails({ name: '', email: '', address: '', city: '', zip: '' });
    setPaymentDetails({ cardName: '', cardNumber: '', expiry: '', cvc: '' });
    setFormErrors({});
    setVerificationInput('');
    setVerificationCode('');
    setResendTimer(0);
    clearTimeout(timerRef.current);
  };

  const sendVerificationCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(code);
    console.log(`%cCódigo de Verificação para ${customerDetails.email}: ${code}`, 'color: #007bff; font-weight: bold;');
    setResendTimer(60);
  };

  const validateStep = (step) => {
      let errors: FormErrors = {};
      if (step === 1) {
          if (!customerDetails.name.trim()) errors.name = "Nome é obrigatório.";
          if (!validateEmail(customerDetails.email)) errors.email = "E-mail inválido.";
          if (!customerDetails.address.trim()) errors.address = "Endereço é obrigatório.";
          if (!customerDetails.city.trim()) errors.city = "Cidade é obrigatória.";
          if (!customerDetails.zip.match(/^\d{5}-\d{3}$/)) errors.zip = "CEP inválido. O formato deve ser 00000-000.";
      }
      if (step === 2) {
        if (verificationInput !== verificationCode) {
            errors.verificationCode = "Código de verificação inválido.";
        }
      }
      if (step === 3) {
          if (!paymentDetails.cardName.trim()) errors.cardName = "Nome no cartão é obrigatório.";
          const cleanedCardNumber = paymentDetails.cardNumber.replace(/\s/g, '');
          if (cleanedCardNumber.length !== 16 || !/^\d{16}$/.test(cleanedCardNumber)) {
              errors.cardNumber = "O número do cartão deve conter exatamente 16 dígitos.";
          }
          if (!paymentDetails.expiry.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) errors.expiry = "Validade inválida (MM/AA).";
          if (!paymentDetails.cvc.match(/^\d{3,4}$/)) errors.cvc = "CVC inválido (3 ou 4 dígitos).";
      }

      setFormErrors(errors);
      return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(checkoutStep)) {
        if (checkoutStep === 1) {
            sendVerificationCode();
        }
        setCheckoutStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setFormErrors({});
    setCheckoutStep(prev => prev - 1);
  };
  
  const handleConfirmPurchase = () => {
      console.log("Purchase Confirmed:", { cart, customerDetails });
      setIsLoading(true);
      setTimeout(() => {
          setIsLoading(false);
          setCheckoutStep(5);
          localStorage.removeItem('domainCart');
      }, 1500);
  };
  
  const handleCustomerDetailsChange = (e) => {
    const { name, value } = e.target;
    if (name === 'zip') {
      const cleanedValue = value.replace(/\D/g, '');
      const truncatedValue = cleanedValue.slice(0, 8);
      let formattedValue = truncatedValue;
      if (truncatedValue.length > 5) {
        formattedValue = `${truncatedValue.slice(0, 5)}-${truncatedValue.slice(5)}`;
      }
      setCustomerDetails(prev => ({ ...prev, zip: formattedValue }));
    } else {
      setCustomerDetails(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePaymentDetailsChange = (e) => {
    const { name, value } = e.target;
    
    let formattedValue = value;

    if (name === 'cardNumber') {
      const cleanedValue = value.replace(/\D/g, '');
      // Add a space after every 4 digits
      formattedValue = cleanedValue.slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
    } else if (name === 'expiry') {
      const cleanedValue = value.replace(/\D/g, '');
      const truncatedValue = cleanedValue.slice(0, 4);
      if (truncatedValue.length > 2) {
        formattedValue = `${truncatedValue.slice(0, 2)}/${truncatedValue.slice(2)}`;
      } else {
        formattedValue = truncatedValue;
      }
    } else if (name === 'cvc') {
      // Limit to 4 digits
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }
    
    setPaymentDetails(prev => ({ ...prev, [name]: formattedValue }));
  };

  const handleVerificationInputChange = (e) => {
    setVerificationInput(e.target.value);
  };
  const handleResendCode = () => {
    if (resendTimer === 0) {
        sendVerificationCode();
    }
  };


  return (
    <>
      {!isCheckoutActive && (
      <>
        <Header />
        <main>
          <Hero 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            handleFormSubmit={handleFormSubmit}
            isLoading={isLoading}
          />
          <Results 
            isLoading={isLoading}
            error={error}
            searchResult={searchResult}
            suggestions={suggestions}
            handleRegisterClick={handleRegisterClick}
            handleSuggestionClick={handleSuggestionClick}
          />
          <Contact 
            contactEmail={contactEmail}
            handleContactEmailChange={handleContactEmailChange}
            handleContactSubmit={handleContactSubmit}
            emailError={emailError}
            formMessage={formMessage}
          />
        </main>
        <Footer />
      </>
      )}

      <CheckoutModal 
        isCheckoutActive={isCheckoutActive}
        checkoutStep={checkoutStep}
        isLoading={isLoading}
        cart={cart}
        customerDetails={customerDetails}
        paymentDetails={paymentDetails}
        formErrors={formErrors}
        verificationInput={verificationInput}
        resendTimer={resendTimer}
        handleCancelCheckout={handleCancelCheckout}
        handleCustomerDetailsChange={handleCustomerDetailsChange}
        handlePaymentDetailsChange={handlePaymentDetailsChange}
        handlePrevStep={handlePrevStep}
        handleNextStep={handleNextStep}
        handleConfirmPurchase={handleConfirmPurchase}
        handleVerificationInputChange={handleVerificationInputChange}
        handleResendCode={handleResendCode}
      />
    </>
  );
};

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);