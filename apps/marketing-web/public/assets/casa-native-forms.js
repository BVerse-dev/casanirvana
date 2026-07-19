(function () {
  "use strict";

  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var fieldNames = {
    name: ["text-286", "text-511"],
    email: ["email-994", "email-631"],
    phone: ["tel-749"],
    reason: ["select-205"],
    message: ["textarea-126"],
    website: ["_wpcf7_ak_hp_textarea"],
  };

  function findField(form, names) {
    for (var index = 0; index < names.length; index += 1) {
      var field = form.elements.namedItem(names[index]);
      if (field) return field;
    }
    return null;
  }

  function valueOf(form, key) {
    var field = findField(form, fieldNames[key]);
    return field && typeof field.value === "string" ? field.value.trim() : "";
  }

  function responseElement(form) {
    var response = form.querySelector(".wpcf7-response-output");
    if (!response) {
      response = document.createElement("div");
      response.className = "wpcf7-response-output";
      form.appendChild(response);
    }
    response.setAttribute("role", "status");
    response.setAttribute("aria-live", "polite");
    return response;
  }

  function clearErrors(form) {
    form.querySelectorAll(".casa-native-error").forEach(function (error) { error.remove(); });
    form.querySelectorAll("[aria-invalid='true']").forEach(function (field) {
      field.removeAttribute("aria-invalid");
      field.classList.remove("wpcf7-not-valid");
    });
  }

  function showErrors(form, errors) {
    clearErrors(form);
    var firstInvalid = null;
    Object.keys(errors).forEach(function (key) {
      var field = findField(form, fieldNames[key] || []);
      if (!field) return;
      field.setAttribute("aria-invalid", "true");
      field.classList.add("wpcf7-not-valid");
      var error = document.createElement("span");
      error.className = "wpcf7-not-valid-tip casa-native-error";
      error.setAttribute("aria-hidden", "true");
      error.textContent = errors[key];
      field.insertAdjacentElement("afterend", error);
      if (!firstInvalid) firstInvalid = field;
    });
    if (firstInvalid) firstInvalid.focus();
  }

  function setState(form, state, message) {
    ["init", "submitting", "sent", "invalid", "failed"].forEach(function (name) {
      form.classList.remove(name);
    });
    form.classList.add(state);
    form.dataset.status = state;
    responseElement(form).textContent = message || "";
  }

  function setPending(form, pending) {
    form.dataset.casaSubmitting = pending ? "true" : "false";
    form.querySelectorAll("button[type='submit'], input[type='submit']").forEach(function (button) {
      button.disabled = pending;
      if (pending) {
        button.dataset.casaLabel = button.tagName === "INPUT" ? button.value : button.innerHTML;
        if (button.tagName === "INPUT") button.value = "Sending...";
        else button.textContent = "Sending...";
      } else if (button.dataset.casaLabel) {
        if (button.tagName === "INPUT") button.value = button.dataset.casaLabel;
        else button.innerHTML = button.dataset.casaLabel;
        delete button.dataset.casaLabel;
      }
    });
  }

  function validateContact(payload) {
    var errors = {};
    if (payload.name.length < 2) errors.name = "Enter your name.";
    if (!emailPattern.test(payload.email)) errors.email = "Enter a valid email address.";
    if (!payload.reason) errors.reason = "Choose a reason for your enquiry.";
    if (payload.message.length < 10) errors.message = "Tell us a little more about your enquiry.";
    return errors;
  }

  async function submitContact(form, payload) {
    var errors = validateContact(payload);
    if (Object.keys(errors).length) {
      showErrors(form, errors);
      setState(form, "invalid", "Please correct the highlighted fields.");
      return;
    }

    clearErrors(form);
    setPending(form, true);
    setState(form, "submitting", "Sending your message...");
    try {
      var response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      var data = await response.json().catch(function () { return null; });
      if (!response.ok) {
        if (data && data.errors) showErrors(form, data.errors);
        throw new Error(data && data.message ? data.message : "We could not send your message. Please try again.");
      }
      form.reset();
      setState(form, "sent", "Thank you. Your message has been received.");
    } catch (error) {
      setState(form, "failed", error instanceof Error ? error.message : "We could not send your message. Please try again.");
    } finally {
      setPending(form, false);
    }
  }

  function handleSubmit(event) {
    var form = event.currentTarget;
    event.preventDefault();
    if (form.dataset.casaSubmitting === "true") return;

    var email = valueOf(form, "email").toLowerCase();
    var name = valueOf(form, "name");
    var message = valueOf(form, "message");

    if (!name && !message) {
      clearErrors(form);
      if (!emailPattern.test(email)) {
        showErrors(form, { email: "Enter a valid email address." });
        setState(form, "invalid", "Enter a valid email address to continue.");
        return;
      }
      window.location.assign("/get-started/?email=" + encodeURIComponent(email));
      return;
    }

    var isNewsletter = name && !message;
    submitContact(form, {
      name: name,
      email: email,
      phone: valueOf(form, "phone"),
      reason: isNewsletter ? "Casa Nirvana product updates" : valueOf(form, "reason"),
      message: isNewsletter ? "Please contact me about Casa Nirvana product news and availability." : message,
      website: valueOf(form, "website"),
    });
  }

  document.querySelectorAll("form.wpcf7-form").forEach(function (form) {
    form.setAttribute("novalidate", "novalidate");
    form.addEventListener("submit", handleSubmit);
    responseElement(form);
  });
})();
