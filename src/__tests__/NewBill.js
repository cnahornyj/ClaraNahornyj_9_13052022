/**
 * @jest-environment jsdom
 */

import { screen, fireEvent, userEvent } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import {ROUTES} from "../constants/routes";
import {localStorageMock} from "../__mocks__/localStorage.js";

describe("Given I am connected as an employee and I'm on NewBill Page", () => {
  describe("When I click on the Send button of the form", () => {
    test("Then I should be sent to dashboard page", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
      }))
      document.body.innerHTML = NewBillUI()
      // Récupérer la classe NewBill pour la simuler
      const newBill = new NewBill({ document, onNavigate, store:null, localStorage})
      // A VERIFIER POUR LE PARAMETRE
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
      const submitForm = screen.getByTestId("form-new-bill")
      submitForm.addEventListener('click', handleSubmit)
      userEvent.click(submitForm)
      // VOIR COMMENT CES FONCTIONS SONT DECLENCHEES
      const updateBill = jest.fn((bill) => newBill.updateBill)
      expect(updateBill).toHaveBeenCalled()
      expect(screen.getByText('Mes notes de frais')).toBeTruthy()
    });
  });
  describe("When I don't fill in the field(s) of the form for creating an expense report and I click on the Send button", () => {
    test("I stay on the Newbill page and I am asked to fill in the missing field(s)", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      // tester la valeur d'un select ?
      // const selectExpenseTypeBill = screen.getByTestId("expense-type");
      // expect(selectExpenseTypeBill.value).toBe("");

      const selectExpenseNameBill = screen.getByTestId("expense-name");
      expect(selectExpenseNameBill.value).toBe("");

      const inputAmountBill = screen.getByTestId("amount");
      expect(inputAmountBill.value).toBe("");

      const selectDateBill = screen.getByTestId("datepicker");
      expect(selectDateBill.value).toBe("");

      const inputVatBill = screen.getByTestId("vat");
      expect(inputVatBill.value).toBe("");

      const inputPctBill = screen.getByTestId("pct");
      expect(inputPctBill.value).toBe("");

      const textAreaCommentBill = screen.getByTestId("commentary");
      expect(textAreaCommentBill.value).toBe("");

      const form = screen.getByTestId("form-new-bill");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId("form-new-bill")).toBeTruthy();
    });
  });
  describe("When I fill in the field(s) of the form for creating an expense report in the wrong format and I click on the Send button", () => {
    test("I stay on the Newbill page and I am asked to fill in the field(s) in the correct format", () => {
      //to-do write assertion
      document.body.innerHTML = NewBillUI();

      const selectExpenseNameBill = screen.getByTestId("expense-name");
      fireEvent.change(selectExpenseNameBill, {
        target: { value: "pasunnom" },
      });
      expect(selectExpenseNameBill.value).toBe("pasunnom");

      // const inputAmountBill = screen.getByTestId("amount");
      // expect(inputAmountBill.value).toBe("");

      // const selectDateBill = screen.getByTestId("datepicker");
      // expect(selectDateBill.value).toBe("");

      // const inputVatBill = screen.getByTestId("vat");
      // expect(inputVatBill.value).toBe("");

      // const inputPctBill = screen.getByTestId("pct");
      // expect(inputPctBill.value).toBe("");

      // const textAreaCommentBill = screen.getByTestId("commentary");
      // expect(textAreaCommentBill.value).toBe("");

      const form = screen.getByTestId("form-new-bill");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId("form-new-bill")).toBeTruthy();

      //       const inputEmailUser = screen.getByTestId("employee-email-input");
      //       fireEvent.change(inputEmailUser, { target: { value: "pasunemail" } });
      //       expect(inputEmailUser.value).toBe("pasunemail");

      //       const inputPasswordUser = screen.getByTestId("employee-password-input");
      //       fireEvent.change(inputPasswordUser, { target: { value: "azerty" } });
      //       expect(inputPasswordUser.value).toBe("azerty");

      // ___________________________________________________________________________________________
    });
  });
  describe("When I click on the Back button in the navigation", () => {
    test("I am sent to the Dashboard page", () => {
      //to-do write assertion
    });
  });
});
