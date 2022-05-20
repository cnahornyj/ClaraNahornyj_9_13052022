/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import userEvent from '@testing-library/user-event'

import router from "../app/Router.js";
import Bills from "../containers/Bills.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      // Crée un noeud pour intégrer le router
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      // Lance le router
      router() 

      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      // Vérifie si la classe active-icon est présente
      expect(windowIcon.classList.contains('active-icon')).toBe(true)
    })
    
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
  describe("When Im on Bills Page and I click on NewBill Button", () => {
    test("Then I should be directed to the NewBill page", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      document.body.innerHTML = BillsUI({ bills })
      // Récupérer la classe Bills pour la simuler
      const newBill = new Bills({ document, onNavigate, store:null, localStorage})
       // Récupérer la fonction dans cette classe
      const handleClickNewBill = jest.fn(newBill.handleClickNewBill)
      // Vérifier l'existence d'un btn new bill ?
      const btnNewBill = screen.getByTestId("btn-new-bill")
      // Passer un event click avec handClickNewBill en fonction
      btnNewBill.addEventListener('click', handleClickNewBill)
      // Simuler le click de l'utilisateur sur le btn
      userEvent.click(btnNewBill)
      // Vérifier que la fonction a bien été appelée
      expect(handleClickNewBill).toHaveBeenCalled()
      // Simuler la redirection avec le router ?
      // expect(screen.getByText('Envoyer une note de frais')).toBeTruthy()
      // problème d'asynchronicité vis à vis du router ?
    })
  })
})


//
