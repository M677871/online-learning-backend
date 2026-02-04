const quizQuestionService = require("../services/quizQuestionService");
const Question = require("../models/quizQuestionModel");
const moment = require('moment');

/**
 * @class QuizQuestionController
 * @description This class handles operations related to quiz questions such as
 *  retrieving, creating, updating, and deleting quiz questions.
 */

class QuizQuestionController {

  /**
   * @async
   * @description Retrieves all quiz questions.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @returns {Object} JSON response containing all quiz questions.
   */

  static async getAllQuestions(req, res) {
    try {
      const questions = await quizQuestionService.getAllQuizQuestions();
      res.status(200).json(questions);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * @async
   * @description Retrieves a specific quiz question by its unique ID.
   * @param {Object} req - The request object containing the question ID in the params.
   * @param {Object} res - The response object.
   * @returns {Object} JSON response with the quiz question.
   */

  static async getQuestionById(req, res) {
    try {
      const { id } = req.params;
      
      const question = await quizQuestionService.getQuizQuestionById(id);
      res.status(200).json(question);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * @async
   * @description Creates a new quiz question based on the provided data.
   * @param {Object} req - The request object containing the quizId and questionText.
   * @param {Object} res - The response object.
   * @returns {Object} JSON response containing the created quiz question.
   */

  static async createQuestion(req, res) {
    try {
      const { quizId, questionText } = req.body;
      const newQuestion = new Question(
        0,
       
        quizId,
        questionText,
        moment().format("YYYY-MM-DD")
      );
      const savedQuestion = await quizQuestionService.createQuizQuestion(
        newQuestion
      );
      res.status(201).json({message:`question created successufly`,result:savedQuestion});
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
    
  }

  /**
   * @async
   * @description Updates an existing quiz question by its unique ID.
   * @param {Object} req - The request object containing the question ID and updated data (quizId and questionText).
   * @param {Object} res - The response object.
   * @returns {Object} JSON response with the updated quiz question.
   */

  static async updateQuestion(req, res) {
    try {
        const { id } = req.params;
      const { quizId, questionText } = req.body;
      let question = new Question(id,quizId, questionText ,moment().format('YYYY-MM-DD'));
      const updatedQuestion = await quizQuestionService.updateQuizQuestion(
       question
      );
      
      res.status(200).json({message:`question updated successufly`,result:updatedQuestion});
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * @async
   * @description Deletes a quiz question by its unique ID.
   * @param {Object} req - The request object containing the question ID in the params.
   * @param {Object} res - The response object.
   * @returns {Object} JSON response with a success message.
   */

  static async deleteQuestion(req, res) {
    try {
        const { id } = req.params;
      await quizQuestionService.deleteQuizQuestion(
      id
      );
      
      res.status(200).json({ message: "Question deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
 
      static showQuestionForm(req, res) {
        try {
          
        res.render("createQuizQuestion.ejs", { error: null });
        }
        catch (error) {
          console.error("Error rendering course form:", error);
          return res.status(500).send("Internal Server Error");
        }
      } 


      static async createQuestionForm(req, res) {
        try {
          const { quizId, questionText } = req.body;
          const newQuestion = new Question(
            0,
           
            quizId,
            questionText,
            moment().format("YYYY-MM-DD")
          );
          const savedQuestion = await quizQuestionService.createQuizQuestion(
            newQuestion
          );
          
          return res.redirect("/api/answer/create-answer");
        } catch (error) {
          console.error("Error during question creation:", error);
          return res.render("createQuizQuestion.ejs", {
            error: "question creation failed. Please try again.",
          });
        }
      }
      static async createQuestionForQuiz(req, res) {
        try {
          const { quizId } = req.params;
          res.render("createQuizQuestion.ejs", { error: null, quizId: quizId });
        } catch (error) {
          console.error("Error rendering question form:", error);
          return res.status(500).send("Internal Server Error");
        }
      }

}

module.exports = QuizQuestionController;
