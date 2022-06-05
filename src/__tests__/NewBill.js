/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee and I'm on NewBill Page", () => {
  describe("When I am on this page", () => {
    test("Then the form should be display", () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      document.body.innerHTML = NewBillUI();
      const form = screen.getByTestId("form-new-bill");
      expect(form).toBeTruthy;
    });
  });
  describe("When I click on the Ajouter un fichier button", () => {
    test("Then, the function to change file should be called", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      document.body.innerHTML = NewBillUI();
      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage,
      });
      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
      const fileBtn = screen.getByTestId("file");
      fileBtn.addEventListener("click", handleChangeFile);
      const event = {
        target: {
          files: ["hello.png"],
        },
      };
      fireEvent.change(fileBtn, event)
    });
  });
  describe("When I click on the Send button of the form",  () => {
    test("Then I should be sent to dashboard page", async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      document.body.innerHTML = NewBillUI()
      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })
      const submit = screen.getByTestId('form-new-bill')
      const validBill = {
        name: "validBill",
        date: "2021-01-01",
        type: "Restaurants et bars",
        amount: 43,
        pct: 5,
        vat: "40",
        fileName: "note-du-restaurant.jpg",
        fileUrl: "https://media-cdn.tripadvisor.com/media/photo-s/12/f9/95/3b/note-du-restaurant.jpg"
      }
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
      newBill.createBill = (newBill) => newBill
      document.querySelector(`input[data-testid="expense-name"]`).value = validBill.name
      document.querySelector(`input[data-testid="datepicker"]`).value = validBill.date
      document.querySelector(`select[data-testid="expense-type"]`).value = validBill.type
      document.querySelector(`input[data-testid="amount"]`).value = validBill.amount
      document.querySelector(`input[data-testid="vat"]`).value = validBill.vat
      document.querySelector(`input[data-testid="pct"]`).value = validBill.pct
      document.querySelector(`textarea[data-testid="commentary"]`).value = validBill.commentary
      newBill.fileUrl = validBill.fileUrl
      newBill.fileName = validBill.fileName 
      submit.addEventListener('click', handleSubmit)
      fireEvent.click(submit)
      expect(handleSubmit).toHaveBeenCalled()
    });
  });
});
